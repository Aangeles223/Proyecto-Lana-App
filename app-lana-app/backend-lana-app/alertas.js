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

// Config Nodemailer (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kripxxloa@gmail.com",
    pass: "ztvrzdbowlxe rtke".replace(/\s/g, ""), // elimina espacios si hay
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

// Obtener saldo total del usuario
async function obtenerSaldo(db, usuario_id) {
  const [rows] = await db.execute(
    `SELECT tipo, monto FROM transacciones WHERE usuario_id = ?`,
    [usuario_id]
  );

  let saldo = 0;
  if (!Array.isArray(rows)) {
    console.warn(`No se obtuvo un array de transacciones para usuario_id=${usuario_id}`);
    return saldo;
  }

  rows.forEach(({ tipo, monto }) => {
    const montoNum = Number(monto);
    if (isNaN(montoNum)) {
      console.warn(`Monto inválido para usuario_id=${usuario_id}:`, monto);
      return;
    }
    saldo += tipo === "ingreso" ? montoNum : -montoNum;
  });

  return saldo;
}

// Obtener pagos fijos próximos (en 2 días)
async function obtenerPagosProximos(db, usuario_id) {
  const [pagos] = await db.execute(
    `SELECT * FROM pagos_fijos WHERE usuario_id = ? AND activo = 1 AND pagado = 0`,
    [usuario_id]
  );

  const hoy = moment();
  const proximos = pagos.filter((pago) => {
    let fechaPago = moment(hoy).date(pago.dia_pago);
    if (fechaPago.isBefore(hoy)) fechaPago.add(1, "month");
    const diffDias = fechaPago.diff(hoy, "days");
    return diffDias >= 0 && diffDias <= 2;
  });

  return proximos;
}

// Crear resumen HTML para el email con los pagos próximos
function crearResumenPagosHTML(pagosProximos) {
  if (pagosProximos.length === 0) return "<p>No hay pagos próximos.</p>";

  const filas = pagosProximos
    .map(
      (pago) =>
        `<tr><td>${pago.nombre}</td><td>$${Number(pago.monto).toFixed(
          2
        )}</td><td>Día ${pago.dia_pago}</td></tr>`
    )
    .join("");

  return `
    <p>A continuación se muestra un resumen de tus pagos fijos próximos:</p>
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

// Función para revisar alertas y enviar si aplica
async function revisarAlertas() {
  const db = await mysql.createConnection(dbConfig);
  try {
    // Obtener usuarios
    const [usuarios] = await db.execute(
      `SELECT id, nombre, email FROM usuarios`
    );

    for (const usuario of usuarios) {
      const saldo = await obtenerSaldo(db, usuario.id);
      const pagosProximos = await obtenerPagosProximos(db, usuario.id);
      const montoTotalProximos = pagosProximos.reduce(
        (sum, p) => sum + Number(p.monto),
        0
      );

      if (pagosProximos.length === 0) {
        console.log(
          `Usuario ${usuario.nombre} no tiene pagos próximos, no se envía alerta.`
        );
        continue; // No hay pagos próximos
      }

      if (typeof saldo !== "number" || isNaN(saldo)) {
        console.warn(
          `Saldo inválido para usuario ${usuario.nombre}, saltando alerta.`
        );
        continue;
      }

      const saldoFormatted = saldo.toFixed(2);
      const montoFormatted = montoTotalProximos.toFixed(2);
      const resumenHTML = crearResumenPagosHTML(pagosProximos);

      if (saldo < montoTotalProximos) {
        // Saldo insuficiente: alerta urgente
        const mensajeHTML = `
          <p>Hola <strong>${usuario.nombre}</strong>,</p>
          <p>Tu saldo actual es <strong>$${saldoFormatted}</strong> y tienes pagos fijos próximos por un total de <strong>$${montoFormatted}</strong>.</p>
          ${resumenHTML}
          <p><strong>Por favor, revisa tu presupuesto para evitar retrasos en tus pagos.</strong></p>
          <p>Saludos,<br><em>Equipo Lana App</em></p>
        `;

        if (usuario.email) {
          try {
            await enviarEmail(
              usuario.email,
              "Alerta: saldo insuficiente para pagos próximos",
              mensajeHTML
            );
            console.log(
              `Email ENVIADO a ${usuario.email} | Usuario: ${usuario.nombre} | Saldo: $${saldoFormatted} | Pagos próximos: $${montoFormatted}`
            );
          } catch (e) {
            console.error(`Error enviando email a ${usuario.email}`, e);
          }
        }
      } else {
        // Saldo suficiente: solo recordatorio
        const mensajeHTML = `
          <p>Hola <strong>${usuario.nombre}</strong>,</p>
          <p>Tu saldo actual es <strong>$${saldoFormatted}</strong> y tienes pagos fijos próximos por un total de <strong>$${montoFormatted}</strong>.</p>
          ${resumenHTML}
          <p>Recuerda preparar tus pagos para evitar retrasos.</p>
          <p>Saludos,<br><em>Equipo Lana App</em></p>
        `;

        if (usuario.email) {
          try {
            await enviarEmail(
              usuario.email,
              "Recordatorio: tienes pagos próximos",
              mensajeHTML
            );
            console.log(
              `Recordatorio enviado a ${usuario.email} | Usuario: ${usuario.nombre} | Saldo: $${saldoFormatted} | Pagos próximos: $${montoFormatted}`
            );
          } catch (e) {
            console.error(`Error enviando recordatorio a ${usuario.email}`, e);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error en revisarAlertas:", err);
  } finally {
    await db.end();
  }
}

// Programar tarea diaria a las 8:00 AM
cron.schedule("0 8 * * *", () => {
  console.log("Ejecutando revisión diaria de alertas: ", new Date());
  revisarAlertas();
});

// Para pruebas rápidas, ejecuta revisarAlertas() directamente
revisarAlertas();