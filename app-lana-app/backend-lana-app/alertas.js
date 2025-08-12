/**
 * alertas.js – Node-cron para pagos fijos automáticos y recordatorios.
 */
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const moment = require("moment");
const dbPool = require("./db");

// Configurar transporter de correo (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kripxxloa@gmail.com",
    pass: "ztvrzdbowlxertke".replace(/\s/g, ""),
  },
});
transporter
  .verify()
  .then(() => console.log("✔️ SMTP configuration ok"))
  .catch((err) => console.error("❌ SMTP configuration failed:", err));

// Envía un email
async function enviarEmail(to, subject, html) {
  console.log(`🔔 Enviando correo a ${to}, asunto: ${subject}`);
  try {
    const info = await transporter.sendMail({
      from: '"Lana App" <kripxxloa@gmail.com>',
      to,
      subject,
      html,
    });
    console.log(`✅ Correo enviado: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Error al enviar correo a ${to}:`, error);
  }
}

// Agrega diffDays y filtra pagos en próximos 0-2 días
function filtrarPagosProximos(pagos) {
  const hoy = moment();
  return pagos
    .map((p) => {
      let fecha = moment(hoy).date(p.dia_pago);
      if (fecha.isBefore(hoy, "day")) fecha.add(1, "month");
      return { ...p, diffDays: fecha.diff(hoy, "days") };
    })
    .filter((p) => p.diffDays >= 0 && p.diffDays <= 2);
}

// Ejecuta el pago hoy si diffDays===0 y marca pagado
async function ejecutarPago(usuario_id, pago) {
  if (pago.diffDays === 0) {
    // Crear transacción de pago fijo
    const [result] = await dbPool.query(
      `INSERT INTO transacciones (usuario_id, categoria_id, monto, tipo, fecha, descripcion)
       VALUES (?, ?, ?, 'egreso', NOW(), ?)`,
      [usuario_id, pago.categoria_id, pago.monto, `Pago fijo: ${pago.nombre}`]
    );
    const transaccionId = result.insertId;
    // Registrar en registros_automaticos
    try {
      await dbPool.query(
        "INSERT INTO registros_automaticos (transaccion_id, origen) VALUES (?, 'pago_fijo')",
        [transaccionId]
      );
      console.log(
        `📝 Registro automático generado para transacción ${transaccionId}`
      );
    } catch (regErr) {
      console.error("Error al guardar registro automático:", regErr);
    }
    // Actualizar última fecha al mes siguiente para el próximo ciclo de pago
    await dbPool.query(
      `UPDATE pagos_fijos 
         SET pagado = 1,
             ultima_fecha = DATE_ADD(NOW(), INTERVAL 1 MONTH)
       WHERE id = ?`,
      [pago.id]
    );
    console.log(`✅ Pago ejecutado para usuario ${usuario_id}: ${pago.nombre}`);
    return true;
  }
  return false;
}

// Revisión diaria de pagos y recordatorios
async function revisarAlertas() {
  console.log("🔄 iniciar revisarAlertas");
  try {
    const [usuarios] = await dbPool.query(
      "SELECT id, nombre, email FROM usuarios"
    );
    for (const u of usuarios) {
      console.log(`Usuario ${u.id} (${u.nombre}) - email: ${u.email}`);
      // Calcular saldo actual
      const [hist] = await dbPool.query(
        "SELECT tipo, monto FROM transacciones WHERE usuario_id = ?",
        [u.id]
      );
      const saldo = hist.reduce(
        (s, t) =>
          s + (t.tipo === "ingreso" ? Number(t.monto) : -Number(t.monto)),
        0
      );
      // Obtener pagos pendientes
      const [pagos] = await dbPool.query(
        "SELECT * FROM pagos_fijos WHERE usuario_id = ? AND activo = 1 AND pagado = 0",
        [u.id]
      );
      console.log(
        `  Pagos totales en DB: ${pagos.length}`,
        pagos.map((p) => ({ id: p.id, dia_pago: p.dia_pago }))
      );
      const proximos = filtrarPagosProximos(pagos);
      console.log(
        `  Pagos próximos a ejecutar/recordar (diffDays 0-2):`,
        proximos.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          diffDays: p.diffDays,
        }))
      );
      // Ejecutar pagos de hoy
      const hechos = [];
      for (const p of proximos) if (await ejecutarPago(u.id, p)) hechos.push(p);
      console.log(
        `  Pagos ejecutados hoy:`,
        hechos.map((p) => p.id)
      );
      if (hechos.length) {
        const lista = hechos
          .map((p) => `<li>${p.nombre}: $${Number(p.monto).toFixed(2)}</li>`)
          .join("");
        await enviarEmail(
          u.email,
          "Pagos fijos ejecutados hoy",
          `<p>Hola <strong>${
            u.nombre
          }</strong>,</p><ul>${lista}</ul><p>Saldo restante: $${saldo.toFixed(
            2
          )}</p>`
        );
        // Registrar notificaciones de pagos ejecutados
        try {
          for (const p of hechos) {
            await dbPool.query(
              "INSERT INTO notificaciones (usuario_id, mensaje, medio, tipo, leido, fecha_envio) VALUES (?, ?, 'email', 'pago_registrado', 0, NOW())",
              [
                u.id,
                `Pago fijo ${p.nombre} ejecutado: $${Number(p.monto).toFixed(
                  2
                )}`,
              ]
            );
          }
          console.log(
            `🔔 Notificaciones de pagos ejecutados registradas para usuario ${u.id}`
          );
        } catch (notifErr) {
          console.error(
            "Error al registrar notificaciones de pagos ejecutados:",
            notifErr
          );
        }
      }
      // Recordatorio (días antes >0)
      const reminder = proximos.filter((p) => p.diffDays > 0);
      if (reminder.length) {
        console.log("⏳ Recordatorio pagos próximos:", reminder);
        const items = reminder
          .map((p) => `<li>${p.nombre}: en ${p.diffDays} día(s)</li>`)
          .join("");
        const subject = "Recordatorio: próximos pagos fijos";
        const html = `<p>Hola <strong>${
          u.nombre
        }</strong>,</p><ul>${items}</ul><p>Saldo actual: $${saldo.toFixed(
          2
        )}</p>`;
        await enviarEmail(u.email, subject, html);
        // Registrar notificaciones de recordatorio de pagos fijos
        try {
          const msg = `Recordatorio de pagos próximos: ${reminder
            .map((p) => p.nombre + " en " + p.diffDays + " día(s)")
            .join(", ")}`;
          // Insert notification with correct enum type
          await dbPool.query(
            "INSERT INTO notificaciones (usuario_id, mensaje, medio, tipo, leido, fecha_envio) VALUES (?, ?, 'email', 'recordatorio', 0, NOW())",
            [u.id, msg]
          );
          console.log(
            `🔔 Notificación de recordatorio registrada para usuario ${u.id}`
          );
        } catch (notifErr) {
          console.error(
            "Error al guardar notificación de recordatorio:",
            notifErr
          );
        }
      }
    }
  } catch (err) {
    console.error("Error en revisarAlertas:", err);
  }
}

// Reset mensual de estado 'pagado' (día 1)
async function resetPagosMensual() {
  try {
    await dbPool.query("UPDATE pagos_fijos SET pagado = 0");
    console.log(`🔄 Reset pagos: ${moment().format("YYYY-MM-DD")}`);
  } catch (err) {
    console.error("Error en resetPagosMensual:", err);
  }
}

cron.schedule("0 8 * * *", () => {
  console.log("⏰ Revisando pagos fijos:", new Date());
  revisarAlertas();
});
cron.schedule("5 0 1 * *", () => {
  console.log("⏳ Reiniciando estado de pagos:", new Date());
  resetPagosMensual();
});
// Dev: ejecutar revisarAlertas cada minuto para ver recordatorios inmediatos
cron.schedule("* * * * *", () => {
  console.log("⏱️ Dev cron - revisarAlertas cada minuto:", new Date());
  revisarAlertas();
});
// Ejecutar revisión de alertas al iniciar (para envío inmediato de recordatorios)
revisarAlertas();
// Exportar función de envío de correo
module.exports = { enviarEmail };
