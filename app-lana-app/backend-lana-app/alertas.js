const cron = require("node-cron");
const nodemailer = require("nodemailer");
const moment = require("moment");
const mysql = require("mysql2/promise");

// Config MySQL
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "12358",
  database: "lana_app",
};

// Config Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kripxxloa@gmail.com",
    pass: "ztvrzdbowlxertke".replace(/\s/g, ""),
  },
});

// Enviar email
async function enviarEmail(to, subject, html) {
  await transporter.sendMail({
    from: '"Lana App" <kripxxloa@gmail.com>',
    to,
    subject,
    html,
  });
}

// Obtener saldo total
async function obtenerSaldo(db, usuario_id) {
  const [rows] = await db.execute(
    `SELECT tipo, monto FROM transacciones WHERE usuario_id = ?`,
    [usuario_id]
  );

  let saldo = 0;
  rows.forEach(({ tipo, monto }) => {
    const montoNum = Number(monto);
    if (!isNaN(montoNum)) {
      saldo += tipo === "ingreso" ? montoNum : -montoNum;
    }
  });

  return saldo;
}

// Pagos próximos (0 a 2 días)
async function obtenerPagosProximos(db, usuario_id) {
  const [pagos] = await db.execute(
    `SELECT * FROM pagos_fijos WHERE usuario_id = ? AND activo = 1 AND pagado = 0`,
    [usuario_id]
  );

  const hoy = moment();
  return pagos.filter((pago) => {
    let fechaPago = moment(hoy).date(pago.dia_pago);
    if (fechaPago.isBefore(hoy, "day")) fechaPago.add(1, "month");
    const diffDias = fechaPago.diff(hoy, "days");
    return diffDias >= 0 && diffDias <= 2;
  });
}

// Resumen HTML
function crearResumenPagosHTML(pagos) {
  if (pagos.length === 0) return "<p>No hay pagos próximos.</p>";

  const filas = pagos
    .map(
      (pago) =>
        `<tr><td>${pago.nombre}</td><td>$${Number(pago.monto).toFixed(
          2
        )}</td><td>Día ${pago.dia_pago}</td></tr>`
    )
    .join("");

  return `
    <p>Pagos:</p>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th>Servicio</th>
          <th>Monto</th>
          <th>Día de pago</th>
        </tr>
      </thead>
      <tbody>
        ${filas}
      </tbody>
    </table>
  `;
}

// Ejecutar pago y registrar
async function ejecutarPago(db, usuario_id, pago, pagosEjecutados) {
  const hoy = moment();
  const fechaPago = moment(hoy).date(pago.dia_pago);
  if (fechaPago.isBefore(hoy, "day")) fechaPago.add(1, "month");

  const diffDias = fechaPago.diff(hoy, "days");

  if (diffDias === 0) {
    try {
      // Egreso
      await db.execute(
        `INSERT INTO transacciones (usuario_id, tipo, monto, fecha) VALUES (?, 'egreso', ?, NOW())`,
        [usuario_id, pago.monto]
      );

      // Marcar como pagado
      await db.execute(
        `UPDATE pagos_fijos SET pagado = 1, ultima_fecha = NOW() WHERE id = ?`,
        [pago.id]
      );

      pagosEjecutados.push(pago);

      console.log(`✅ Pago ejecutado: usuario=${usuario_id}, pago=${pago.nombre}, monto=${pago.monto}`);
    } catch (error) {
      console.error(`❌ Error ejecutando pago usuario=${usuario_id}`, error);
    }
  }
}

// Revisión diaria
async function revisarAlertas() {
  const db = await mysql.createConnection(dbConfig);
  try {
    const [usuarios] = await db.execute(`SELECT id, nombre, email FROM usuarios`);

    for (const usuario of usuarios) {
      const saldo = await obtenerSaldo(db, usuario.id);
      const pagosProximos = await obtenerPagosProximos(db, usuario.id);
      const montoTotalProximos = pagosProximos.reduce(
        (sum, p) => sum + Number(p.monto),
        0
      );

      let pagosEjecutados = [];

      // Ejecutar si es el día exacto
      for (const pago of pagosProximos) {
        await ejecutarPago(db, usuario.id, pago, pagosEjecutados);
      }

      // Si hubo pagos ejecutados, mandar correo resumen
      if (pagosEjecutados.length > 0 && usuario.email) {
        const resumenHTML = crearResumenPagosHTML(pagosEjecutados);
        const mensajeHTML = `
          <p>Hola <strong>${usuario.nombre}</strong>,</p>
          <p>Hoy se ejecutaron los siguientes pagos automáticamente:</p>
          ${resumenHTML}
          <p>Saldo antes de pagos: <strong>$${saldo.toFixed(2)}</strong></p>
          <p>Saldo después: <strong>$${(saldo - pagosEjecutados.reduce((s,p)=>s+Number(p.monto),0)).toFixed(2)}</strong></p>
        `;
        try {
          await enviarEmail(usuario.email, "Resumen de pagos ejecutados hoy", mensajeHTML);
          console.log(`📧 Correo de pagos ejecutados enviado a ${usuario.email}`);
        } catch (e) {
          console.error(`Error enviando correo de pagos ejecutados a ${usuario.email}`, e);
        }
      }

      // Si no tiene pagos hoy pero sí próximos, mandar alerta
      if (pagosProximos.length > 0) {
        const resumenHTML = crearResumenPagosHTML(pagosProximos);
        if (saldo < montoTotalProximos) {
          const mensajeHTML = `
            <p>Hola <strong>${usuario.nombre}</strong>,</p>
            <p>Saldo actual: <strong>$${saldo.toFixed(2)}</strong></p>
            <p>Pagos próximos por un total de: <strong>$${montoTotalProximos.toFixed(2)}</strong></p>
            ${resumenHTML}
            <p><strong>Saldo insuficiente para cubrir pagos próximos.</strong></p>
          `;
          await enviarEmail(usuario.email, "Alerta: saldo insuficiente para pagos próximos", mensajeHTML);
        } else {
          const mensajeHTML = `
            <p>Hola <strong>${usuario.nombre}</strong>,</p>
            <p>Saldo actual: <strong>$${saldo.toFixed(2)}</strong></p>
            ${resumenHTML}
            <p>Recuerda que tienes pagos próximos en los próximos días.</p>
          `;
          await enviarEmail(usuario.email, "Recordatorio: pagos próximos", mensajeHTML);
        }
      }
    }
  } catch (err) {
    console.error("Error en revisarAlertas:", err);
  } finally {
    await db.end();
  }
}

// Reset mensual de pagos
async function resetPagosMensual() {
  const db = await mysql.createConnection(dbConfig);
  try {
    await db.execute(`UPDATE pagos_fijos SET pagado = 0`);
    console.log(`🔄 Pagos reiniciados para nuevo mes: ${moment().format("YYYY-MM-DD")}`);
  } catch (err) {
    console.error("Error en resetPagosMensual:", err);
  } finally {
    await db.end();
  }
}

// CRON diario 8 AM para revisar pagos
cron.schedule("0 8 * * *", () => {
  console.log("⏰ Revisando alertas:", new Date());
  revisarAlertas();
});

// CRON mensual el día 1 a las 00:05 para reiniciar pagos
cron.schedule("5 0 1 * *", () => {
  console.log("⏳ Reiniciando estado de pagos:", new Date());
  resetPagosMensual();
});

// Para pruebas manuales
revisarAlertas();