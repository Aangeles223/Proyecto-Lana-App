const express = require("express");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
// Ensure URLSearchParams is available
const { URLSearchParams } = require("url");

// Remove proxy, add MySQL pool and bcrypt
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const { enviarEmail } = require("./alertas");

// Configuración de pool de conexiones MySQL
const dbPool = require("./db");
// Alias db a pool para mantener compatibilidad con rutas existentes
db = dbPool;

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "http://localhost:8000"; // FastAPI URL
const api = axios.create({ baseURL: API_URL });

// Login handler usando pool de MySQL
app.post("/login", async (req, res) => {
  console.log("📥 Proxy Express recibió POST /login con body:", req.body);
  const { email, contrasena } = req.body;
  if (!email || !contrasena) {
    return res
      .status(400)
      .json({ success: false, message: "Email y contraseña son obligatorios" });
  }
  try {
    const [results] = await dbPool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );
    console.log("🔍 SQL login results:", results);
    if (
      results.length === 0 ||
      !bcrypt.compareSync(contrasena, results[0].contrasena)
    ) {
      console.log("❌ Credenciales invalidas para email:", email);
      return res
        .status(401)
        .json({ success: false, message: "Correo o contraseña incorrectos" });
    }
    const { contrasena: _, ...userData } = results[0];
    console.log("✅ Login exitoso, userData:", userData);
    res.json({ success: true, user: userData });
    console.log("➡️ Respondido /login con success: true");
  } catch (err) {
    console.error("Error SQL en login:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error en el servidor" });
  }
});
// Registrar nuevo usuario directamente en MySQL
app.post("/register", async (req, res) => {
  const { nombre, apellidos, email, telefono, contrasena } = req.body;
  if (!nombre || !apellidos || !email || !contrasena) {
    return res
      .status(400)
      .json({ success: false, error: "Faltan datos obligatorios" });
  }
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(contrasena, salt);
    const [result] = await dbPool.query(
      "INSERT INTO usuarios (nombre, apellidos, email, telefono, contrasena) VALUES (?, ?, ?, ?, ?)",
      [nombre, apellidos, email, telefono, hash]
    );
    res.json({ success: true, insertId: result.insertId });
  } catch (err) {
    console.error("Error SQL al registrar usuario:", err);
    res.status(500).json({ success: false, error: err });
  }
});
// Historial de transacciones → obtener directamente de MySQL
app.get("/transacciones/historial/:usuario_id", async (req, res) => {
  const usuario_id = req.params.usuario_id;
  try {
    console.log(`📥 GET /transacciones/historial/${usuario_id}`);
    const [rows] = await dbPool.query(
      `SELECT t.id, t.tipo, t.monto, t.fecha, t.descripcion, c.nombre AS categoria
       FROM transacciones t
       LEFT JOIN categorias c ON t.categoria_id = c.id
       WHERE t.usuario_id = ?
       ORDER BY t.fecha DESC`,
      [usuario_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error SQL historial transacciones:", err);
    res.status(500).json({ success: false, error: err });
  }
});
// Listar usuarios para alertas
app.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await dbPool.query("SELECT id, nombre, email FROM usuarios");
    res.json(rows);
  } catch (err) {
    console.error("Error SQL al listar usuarios:", err);
    res.status(500).json({ success: false, error: err });
  }
});
// Obtener perfil de usuario (ruta plural)
app.get("/usuarios/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const [[user]] = await dbPool.query(
      "SELECT id, nombre, apellidos, email, telefono FROM usuarios WHERE id = ?",
      [usuario_id]
    );
    if (user) res.json({ success: true, user });
    else
      res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
  } catch (err) {
    console.error("Error SQL GET /usuarios/:usuario_id", err);
    res.status(500).json({ success: false, error: err });
  }
});

app.post("/presupuestos", async (req, res) => {
  const { usuario_id, categoria_id, monto_mensual, mes, anio } = req.body;
  try {
    // Verificar si ya existe un presupuesto para usuario/categoría/mes/año
    const [existing] = await dbPool.query(
      "SELECT id FROM presupuestos WHERE usuario_id = ? AND categoria_id = ? AND mes = ? AND anio = ?",
      [usuario_id, categoria_id, mes, anio]
    );
    let presupuestoId;
    let isUpdate = false;
    if (existing.length > 0) {
      presupuestoId = existing[0].id;
      // Actualizar monto
      await dbPool.query(
        "UPDATE presupuestos SET monto_mensual = ? WHERE id = ?",
        [monto_mensual, presupuestoId]
      );
      isUpdate = true;
      console.log(`🔄 Presupuesto existente ${presupuestoId} actualizado.`);
    } else {
      // Crear nuevo presupuesto
      const [result] = await dbPool.query(
        "INSERT INTO presupuestos (usuario_id, categoria_id, monto_mensual, mes, anio) VALUES (?, ?, ?, ?, ?)",
        [usuario_id, categoria_id, monto_mensual, mes, anio]
      );
      presupuestoId = result.insertId;
      console.log(`➕ Presupuesto nuevo creado ${presupuestoId}.`);
    }
    // Responder éxito
    res.json({ success: true, id: presupuestoId, updated: isUpdate });
    // Enviar email y registrar notificación
    try {
      const [[{ email, nombre }]] = await dbPool.query(
        "SELECT email, nombre FROM usuarios WHERE id = ?",
        [usuario_id]
      );
      const tipoNoti = isUpdate ? "presupuesto_actualizado" : "presupuesto";
      const asunto = isUpdate
        ? "Presupuesto actualizado"
        : "Presupuesto creado";
      const mensaje = isUpdate
        ? `El presupuesto (${presupuestoId}) se actualizó a $${Number(
            monto_mensual
          ).toFixed(2)}.`
        : `Se ha creado un nuevo presupuesto de $${Number(
            monto_mensual
          ).toFixed(2)}.`;
      const html = `<p>Hola <strong>${nombre}</strong>,</p><p>${mensaje}</p>`;
      await enviarEmail(email, asunto, html);
      await dbPool.query(
        "INSERT INTO notificaciones (usuario_id, mensaje, medio, tipo, leido, fecha_envio) VALUES (?, ?, 'email', ?, 0, NOW())",
        [usuario_id, mensaje, tipoNoti]
      );
      console.log(
        `🔔 Notificación ${tipoNoti} enviada para usuario ${usuario_id}`
      );
    } catch (notifErr) {
      console.error("Error en notificación presupuesto:", notifErr);
    }
  } catch (err) {
    console.error("Error SQL en POST /presupuestos:", err);
    res.status(500).json({ success: false, error: err });
  }
});
// Listar categorías desde MySQL
app.get("/categorias", async (req, res) => {
  try {
    const [rows] = await dbPool.query("SELECT * FROM categorias");
    console.log("DB -> /categorias rows:", rows);
    res.json(rows);
  } catch (err) {
    console.error("Error SQL al listar categorías:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Crear transacción en MySQL con pool
app.post("/transacciones", async (req, res) => {
  console.log(`📥 POST /transacciones body:`, req.body);
  const { usuario_id, categoria_id, monto, tipo, fecha, descripcion } =
    req.body;
  // Validar categoría
  if (categoria_id == null) {
    console.warn(
      `Categoria_id faltante en POST /transacciones por usuario ${req.body.usuario_id}`
    );
    return res
      .status(400)
      .json({ success: false, error: "categoria_id es obligatorio" });
  }
  // Bloquear transacción si excede presupuesto mensual
  if (tipo === "egreso") {
    // Obtener mes y año de la transacción
    const fechaObj = new Date(fecha);
    const mes = fechaObj.getMonth() + 1;
    const anio = fechaObj.getFullYear();
    console.log(
      `🔍 Debug fecha: ${fecha}, mes=${mes}, anio=${anio}, categoria_id=${categoria_id}`
    );
    // Obtener monto mensual del presupuesto vigente
    const [[budgetInfo]] = await dbPool.query(
      `SELECT monto_mensual FROM presupuestos
       WHERE usuario_id=? AND categoria_id=? AND mes=? AND anio=?
       ORDER BY id DESC LIMIT 1`,
      [usuario_id, categoria_id, mes, anio]
    );
    console.log("🔍 Debug budgetInfo returned:", budgetInfo);
    if (budgetInfo) {
      // Calcular total egresos hasta ahora y convertir a número
      const [[{ spent }]] = await dbPool.query(
        `SELECT COALESCE(SUM(CASE WHEN tipo='egreso' THEN monto ELSE 0 END), 0) AS spent
           FROM transacciones
           WHERE usuario_id=? AND categoria_id=? AND MONTH(fecha)=? AND YEAR(fecha)=?`,
        [usuario_id, categoria_id, mes, anio]
      );
      const spentNum = Number(spent);
      const montoNum = Number(monto);
      const budgetNum = Number(budgetInfo.monto_mensual);
      // Debug: imprimir valores de presupuesto
      console.log(
        `🔍 Debug presupuesto: spent=${spentNum}, nuevoMonto=${montoNum}, presupuesto=${budgetNum}`
      );
      // Si el nuevo monto supera el presupuesto
      if (spentNum + montoNum > budgetNum) {
        // Enviar aviso de presupuesto excedido y registrar notificación
        const [[{ email, nombre }]] = await dbPool.query(
          "SELECT email, nombre FROM usuarios WHERE id = ?",
          [usuario_id]
        );
        const asunto = "Transacción cancelada: presupuesto excedido";
        const mensajeNoti = `Transacción cancelada de $${Number(monto).toFixed(
          2
        )}: excede tu presupuesto mensual de $${Number(
          budgetInfo.monto_mensual
        ).toFixed(2)} para esta categoría.`;
        const html = `<p>Hola <strong>${nombre}</strong>,</p><p>No puedes realizar esta transacción de <strong>$${Number(
          monto
        ).toFixed(
          2
        )}</strong> en esta categoría, pues excede tu presupuesto mensual de <strong>$${Number(
          budgetInfo.monto_mensual
        ).toFixed(2)}</strong>.</p>`;
        await enviarEmail(email, asunto, html);
        // Registrar notificación de bloqueo por presupuesto excedido
        await dbPool.query(
          "INSERT INTO notificaciones (usuario_id, mensaje, medio, tipo, leido, fecha_envio) VALUES (?, ?, 'email', 'exceso_presupuesto', 0, NOW())",
          [usuario_id, mensajeNoti]
        );
        return res.status(400).json({
          success: false,
          error: "Presupuesto excedido",
          spent: spentNum,
          budget: budgetNum,
        });
      } else {
        console.log(
          `✅ Transacción permitida: ${spentNum} + ${montoNum} = ${
            spentNum + montoNum
          } <= ${budgetNum}`
        );
      }
    }
  }
  try {
    const [result] = await dbPool.query(
      "INSERT INTO transacciones (usuario_id, categoria_id, monto, tipo, fecha, descripcion) VALUES (?, ?, ?, ?, ?, ?)",
      [usuario_id, categoria_id, monto, tipo, fecha, descripcion]
    );
    const id = result.insertId;
    res.json({
      success: true,
      id,
      usuario_id,
      categoria_id,
      monto,
      tipo,
      fecha,
      descripcion,
    });

    // Enviar correo de confirmación de transacción
    try {
      const [[{ email, nombre }]] = await dbPool.query(
        "SELECT email, nombre FROM usuarios WHERE id = ?",
        [usuario_id]
      );
      const asunto =
        tipo === "ingreso"
          ? "Confirmación de ingreso"
          : "Notificación de transacción";
      const [rows] = await dbPool.query(
        "SELECT tipo, monto FROM transacciones WHERE usuario_id = ?",
        [usuario_id]
      );
      const saldoCalc = rows.reduce(
        (s, r) =>
          s + (r.tipo === "ingreso" ? Number(r.monto) : -Number(r.monto)),
        0
      );
      const html = `<p>Hola <strong>${nombre}</strong>,</p>
<p>Se ha registrado una ${
        tipo === "ingreso" ? "entrada" : "transacción"
      } por <strong>$${Number(monto).toFixed(2)}</strong>.</p>
<p>Saldo actual: <strong>$${saldoCalc.toFixed(2)}</strong></p>`;
      await enviarEmail(email, asunto, html);
      console.log(`📧 Correo de transacción enviado a ${email}`);
      // Guardar notificación en DB (silenciar truncamientos de tipo)
      try {
        const mensaje = `Se registró una ${
          tipo === "ingreso" ? "entrada" : "transacción"
        } de $${Number(monto).toFixed(2)}`;
        await dbPool.query(
          "INSERT INTO notificaciones (usuario_id, mensaje, medio, tipo, leido, fecha_envio) VALUES (?, ?, 'email', 'transaccion', 0, NOW())",
          [usuario_id, mensaje]
        );
        console.log(`🔔 Notificación registrada para usuario ${usuario_id}`);
      } catch (notifErr) {
        if (notifErr.code === "WARN_DATA_TRUNCATED") {
          console.warn(
            "⚠️ Truncamiento al guardar notificación (tipo no válido), se omitió:",
            notifErr.sqlMessage
          );
        } else {
          console.error("Error al guardar notificación:", notifErr);
        }
      }

      // Comprobar si se excede el presupuesto
      try {
        // Obtener datos de usuario para notificación de presupuesto excedido
        const [[{ email, nombre }]] = await dbPool.query(
          "SELECT email, nombre FROM usuarios WHERE id = ?",
          [usuario_id]
        );
        const txDate = new Date(fecha);
        const txMonth = txDate.getMonth() + 1;
        const txYear = txDate.getFullYear();
        // Total gastado en esta categoría para el mes
        const [[{ spent }]] = await dbPool.query(
          `SELECT COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0) AS spent
           FROM transacciones
           WHERE usuario_id = ? AND categoria_id = ? AND MONTH(fecha) = ? AND YEAR(fecha) = ?`,
          [usuario_id, categoria_id, txMonth, txYear]
        );
        const gastado = Number(spent);
        // Obtener último presupuesto para esta categoría/mes/año
        const [[budgetInfo]] = await dbPool.query(
          `SELECT p.monto_mensual, c.nombre AS categoria
           FROM presupuestos p
           JOIN categorias c ON p.categoria_id = c.id
           WHERE p.usuario_id = ? AND p.categoria_id = ? AND p.mes = ? AND p.anio = ?
           ORDER BY p.id DESC LIMIT 1`,
          [usuario_id, categoria_id, txMonth, txYear]
        );
        // Envío de alerta si cercano al límite (>=80% y <100%)
        if (budgetInfo) {
          const umbral = 0.8 * Number(budgetInfo.monto_mensual);
          if (gastado >= umbral && gastado < Number(budgetInfo.monto_mensual)) {
            const acercMsg = `Has usado ${gastado.toFixed(2)} de $${Number(
              budgetInfo.monto_mensual
            ).toFixed(2)} de tu presupuesto para ${
              budgetInfo.categoria
            } en ${txMonth}/${txYear}.`;
            const asuntoAcerc = "Alerta: Presupuesto cercano al límite";
            const htmlAcerc = `<p>Hola <strong>${nombre}</strong>,</p><p>${acercMsg}</p>`;
            await enviarEmail(email, asuntoAcerc, htmlAcerc);
            // Registrar alerta de presupuesto cercano al límite
            await dbPool.query(
              "INSERT INTO notificaciones (usuario_id, mensaje, medio, tipo, leido, fecha_envio) VALUES (?, ?, 'email', 'alerta_pago', 0, NOW())",
              [usuario_id, acercMsg]
            );
            console.log(
              `🔔 Alerta cercano a presupuesto enviada a usuario ${usuario_id}`
            );
          }
        }
        // Si se excede el presupuesto (gastado > límite)
        if (budgetInfo && Number(spent) > budgetInfo.monto_mensual) {
          const overMsg = `Has gastado $${gastado.toFixed(
            2
          )} de tu presupuesto de $${Number(budgetInfo.monto_mensual).toFixed(
            2
          )} para ${budgetInfo.categoria} (${txMonth}/${txYear}).`;
          const asuntoPres = "Alerta: Presupuesto Excedido";
          const htmlPres = `<p>Hola <strong>${nombre}</strong>,</p><p>${overMsg}</p>`;
          await enviarEmail(email, asuntoPres, htmlPres);
          // Registrar notificación de presupuesto excedido (usar enum correcto)
          try {
            await dbPool.query(
              "INSERT INTO notificaciones (usuario_id, mensaje, medio, tipo, leido, fecha_envio) VALUES (?, ?, 'email', 'exceso_presupuesto', 0, NOW())",
              [usuario_id, overMsg]
            );
            console.log(
              `🔔 Alerta de presupuesto excedido enviada a usuario ${usuario_id}`
            );
          } catch (notifErr) {
            if (notifErr.code === "WARN_DATA_TRUNCATED") {
              console.warn(
                "⚠️ Truncamiento al guardar notificación de presupuesto excedido, se omitió:",
                notifErr.sqlMessage
              );
            } else {
              console.error(
                "Error al guardar notificación de presupuesto excedido:",
                notifErr
              );
            }
          }
        }
      } catch (overErr) {
        console.error("Error alerta de presupuesto excedido:", overErr);
      }
    } catch (e) {
      console.error("Error enviando email transacción:", e);
    }
  } catch (err) {
    console.error("Error SQL al crear transacción:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Crear presupuesto mensual
app.post("/presupuestos", async (req, res) => {
  const { usuario_id, categoria_id, monto_mensual, mes, anio } = req.body;
  try {
    const [result] = await dbPool.query(
      "INSERT INTO presupuestos (usuario_id, categoria_id, monto_mensual, mes, anio) VALUES (?, ?, ?, ?, ?)",
      [usuario_id, categoria_id, monto_mensual, mes, anio]
    );
    // Responder éxito al cliente
    res.json({ success: true, id: result.insertId });
    // Enviar email y registrar notificación en DB
    try {
      const [[{ email, nombre }]] = await dbPool.query(
        "SELECT email, nombre FROM usuarios WHERE id = ?",
        [usuario_id]
      );
      const asunto = "Presupuesto creado";
      const mensaje = `Se ha creado un presupuesto de $${Number(
        monto_mensual
      ).toFixed(2)} para la categoría ${categoria_id}`;
      const html = `<p>Hola <strong>${nombre}</strong>,</p><p>Se ha creado un nuevo presupuesto por <strong>$${Number(
        monto_mensual
      ).toFixed(2)}</strong>.</p>`;
      await enviarEmail(email, asunto, html);
      console.log(`📧 Correo de presupuesto enviado a ${email}`);
      await dbPool.query(
        "INSERT INTO notificaciones (usuario_id, mensaje, medio, tipo, leido, fecha_envio) VALUES (?, ?, 'email', 'presupuesto', 0, NOW())",
        [usuario_id, mensaje]
      );
      console.log(
        `🔔 Notificación registrada para presupuesto usuario ${usuario_id}`
      );
    } catch (notifErr) {
      console.error("Error al enviar notificación de presupuesto:", notifErr);
    }
  } catch (err) {
    console.error("Error SQL al crear presupuesto:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Obtener presupuestos mensuales para un usuario con gasto acumulado
app.get("/presupuestos/:usuario_id", async (req, res) => {
  const usuario_id = req.params.usuario_id;
  try {
    console.log(`📥 GET /presupuestos/${usuario_id}`);
    // Seleccionar un presupuesto por categoría/mes/año (el más reciente) para evitar duplicados
    const query = `
      SELECT p.id,
        ANY_VALUE(c.nombre) AS categoria,
        ANY_VALUE(p.monto_mensual) AS monto_mensual,
        ANY_VALUE(p.mes) AS mes,
        ANY_VALUE(p.anio) AS anio,
        COALESCE(SUM(CASE WHEN t.tipo = 'ingreso' THEN t.monto ELSE -t.monto END), 0) AS gastado
      FROM (
        SELECT usuario_id, categoria_id, mes, anio, MAX(id) AS id
        FROM presupuestos
        WHERE usuario_id = ?
        GROUP BY categoria_id, mes, anio
      ) AS latest
      JOIN presupuestos p ON p.id = latest.id
      JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN transacciones t
        ON t.usuario_id = p.usuario_id
        AND t.categoria_id = p.categoria_id
        AND MONTH(t.fecha) = p.mes
        AND YEAR(t.fecha) = p.anio
    GROUP BY p.id
      ORDER BY p.anio DESC, p.mes DESC
    `;
    const [rows] = await dbPool.query(query, [usuario_id]);
    console.log(`↗️ Presupuestos unicos:`, rows);
    res.json({ success: true, presupuestos: rows });
  } catch (err) {
    console.error("Error SQL al listar presupuestos:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Reporte de gastos → obtener totales por categoría
// Reporte de gastos → obtener totales por categoría
app.get("/reporte/:usuario_id/:anio/:mes", async (req, res) => {
  const { usuario_id, anio, mes } = req.params;
  const sql = `
    SELECT c.nombre AS categoria,
      COALESCE(SUM(CASE WHEN t.tipo = 'ingreso' THEN t.monto ELSE 0 END), 0) AS ingresos,
      COALESCE(SUM(CASE WHEN t.tipo = 'egreso' THEN t.monto ELSE 0 END), 0) AS egresos
    FROM transacciones t
    JOIN categorias c ON t.categoria_id = c.id
    WHERE t.usuario_id = ? AND YEAR(t.fecha) = ? AND MONTH(t.fecha) = ?
    GROUP BY c.nombre
  `;
  try {
    const [rows] = await dbPool.query(sql, [usuario_id, anio, mes]);
    res.json({ success: true, reporte: rows });
  } catch (err) {
    console.error("Error SQL reporte de gastos:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Actualizar presupuesto mensual
app.put("/presupuestos/:presupuesto_id", async (req, res) => {
  console.log(`📥 PUT /presupuestos/${req.params.presupuesto_id}`, req.body);
  const { monto_mensual } = req.body;
  const id = req.params.presupuesto_id;
  try {
    // Actualizar monto
    await dbPool.query(
      "UPDATE presupuestos SET monto_mensual = ? WHERE id = ?",
      [monto_mensual, id]
    );
    // Obtener datos actualizados con nombre de categoría
    const [rows] = await dbPool.query(
      `SELECT p.*, c.nombre AS categoria FROM presupuestos p
       JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    const presupuesto = rows[0];
    // Además, actualizar todos los registros de ese mes/categoría para reflejar la misma cifra
    await dbPool.query(
      "UPDATE presupuestos SET monto_mensual = ? WHERE usuario_id = ? AND categoria_id = ? AND mes = ? AND anio = ?",
      [
        monto_mensual,
        presupuesto.usuario_id,
        presupuesto.categoria_id,
        presupuesto.mes,
        presupuesto.anio,
      ]
    );
    // Responder al cliente
    res.json({ success: true, presupuesto });
    // Enviar email y registrar notificación de actualización
    try {
      const [[{ email, nombre }]] = await dbPool.query(
        "SELECT email, nombre FROM usuarios WHERE id = ?",
        [presupuesto.usuario_id]
      );
      const asunto = "Presupuesto actualizado";
      const mensaje = `El presupuesto de la categoría ${
        presupuesto.categoria
      } se actualizó a $${Number(monto_mensual).toFixed(2)}.`;
      const html = `<p>Hola <strong>${nombre}</strong>,</p><p>Tu presupuesto para <strong>${
        presupuesto.categoria
      }</strong> ha sido actualizado a <strong>$${Number(monto_mensual).toFixed(
        2
      )}</strong>.</p>`;
      await enviarEmail(email, asunto, html);
      console.log(`📧 Correo de actualización enviado a ${email}`);
      try {
        await dbPool.query(
          "INSERT INTO notificaciones (usuario_id, mensaje, medio, tipo, leido, fecha_envio) VALUES (?, ?, 'email', 'presupuesto', 0, NOW())",
          [presupuesto.usuario_id, mensaje]
        );
        console.log(
          `🔔 Notificación registrada para usuario ${presupuesto.usuario_id}`
        );
      } catch (notifErr) {
        if (notifErr.code === "WARN_DATA_TRUNCATED") {
          console.warn(
            "⚠️ Truncamiento al guardar notificación de actualización de presupuesto, se omitió:",
            notifErr.sqlMessage
          );
        } else {
          console.error(
            "Error al guardar notificación de actualización de presupuesto:",
            notifErr
          );
        }
      }
    } catch (notifErr) {
      console.error(
        "Error al enviar notificación de actualización de presupuesto:",
        notifErr
      );
    }
  } catch (err) {
    console.error("Error SQL al actualizar presupuesto:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Eliminar presupuesto mensual
app.delete("/presupuestos/:presupuesto_id", async (req, res) => {
  console.log(`📥 DELETE /presupuestos/${req.params.presupuesto_id}`);
  const id = req.params.presupuesto_id;
  try {
    const [result] = await dbPool.query(
      "DELETE FROM presupuestos WHERE id = ?",
      [id]
    );
    console.log(`↗️ Filas eliminadas: ${result.affectedRows}`);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Presupuesto no encontrado" });
    }
    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("Error SQL al eliminar presupuesto:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Obtener pagos fijos de un usuario directamente desde MySQL
// Obtener pagos fijos de un usuario usando promesas
app.get("/pagos_fijos/usuario/:usuario_id", async (req, res) => {
  const usuario_id = req.params.usuario_id;
  try {
    const [rows] = await dbPool.query(
      "SELECT * FROM pagos_fijos WHERE usuario_id = ?",
      [usuario_id]
    );
    res.json({ success: true, pagos_fijos: rows });
  } catch (err) {
    console.error("Error SQL al listar pagos fijos por usuario:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Proxy GET pagos fijos a FastAPI
app.get("/pagos_fijos", async (req, res) => {
  try {
    const response = await api.get("/pagos_fijos", {
      params: { usuario_id: req.query.usuario_id },
    });
    res.json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { success: false, message: err.message });
  }
});

// Proxy POST pagos fijos a FastAPI
// Crear nuevo pago fijo y enviar notificación
app.post("/pagos_fijos", async (req, res) => {
  const {
    usuario_id,
    servicio_id,
    nombre,
    monto,
    categoria_id,
    dia_pago,
    activo,
    pagado,
    ultima_fecha,
  } = req.body;
  try {
    const [result] = await dbPool.query(
      `INSERT INTO pagos_fijos (usuario_id, servicio_id, nombre, monto, categoria_id, dia_pago, activo, pagado, ultima_fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_id,
        servicio_id,
        nombre,
        monto,
        categoria_id,
        dia_pago,
        activo,
        pagado,
        ultima_fecha,
      ]
    );
    const nuevoId = result.insertId;
    res.json({ success: true, pago_id: nuevoId });
    // Enviar correo y registrar notificación de creación
    try {
      const [[user]] = await dbPool.query(
        "SELECT email, nombre FROM usuarios WHERE id = ?",
        [usuario_id]
      );
      if (user?.email) {
        const asunto = "Pago fijo creado";
        const html = `<p>Hola <strong>${user.nombre}</strong>,</p>
          <p>Se ha creado un nuevo pago fijo: <strong>${nombre}</strong> por <strong>$${Number(
          monto
        ).toFixed(2)}</strong> cada mes.</p>`;
        await enviarEmail(user.email, asunto, html);
        await dbPool.query(
          `INSERT INTO notificaciones (usuario_id, mensaje, medio, tipo, leido, fecha_envio)
           VALUES (?, ?, 'email', 'pago_fijo_creado', 0, NOW())`,
          [
            usuario_id,
            `Pago fijo ${nombre} creado por $${Number(monto).toFixed(2)}`,
          ]
        );
      }
    } catch (notifErr) {
      console.error("Error enviando notificación de pago fijo:", notifErr);
    }
  } catch (err) {
    console.error("Error SQL POST /pagos_fijos:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Proxy DELETE pagos fijos a FastAPI
// Actualizar pago fijo usando promesas
app.put("/pagos_fijos/:pago_id", async (req, res) => {
  const id = req.params.pago_id;
  const { servicio_id, nombre, monto, categoria_id, dia_pago, activo, pagado } =
    req.body;
  try {
    const [result] = await dbPool.query(
      `UPDATE pagos_fijos SET servicio_id = ?, nombre = ?, monto = ?, categoria_id = ?, dia_pago = ?, activo = ?, pagado = ? WHERE id = ?`,
      [servicio_id, nombre, monto, categoria_id, dia_pago, activo, pagado, id]
    );
    res.json({ success: true, updatedId: id });
  } catch (err) {
    console.error("Error SQL al actualizar pago fijo:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Eliminar pago fijo usando promesas
app.delete("/pagos_fijos/:pago_id", async (req, res) => {
  const id = req.params.pago_id;
  try {
    const [result] = await dbPool.query(
      "DELETE FROM pagos_fijos WHERE id = ?",
      [id]
    );
    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("Error SQL al eliminar pago fijo:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Listar servicios usando promesas
app.get("/servicios", async (req, res) => {
  try {
    const [rows] = await dbPool.query("SELECT * FROM servicios");
    res.json(rows);
  } catch (err) {
    console.error("Error SQL al listar servicios:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Obtener notificaciones de un usuario
app.get("/notificaciones/:usuario_id", async (req, res) => {
  const usuario_id = req.params.usuario_id;
  try {
    const [rows] = await dbPool.query(
      "SELECT id, mensaje, medio, tipo, leido, fecha_envio FROM notificaciones WHERE usuario_id = ? ORDER BY fecha_envio DESC",
      [usuario_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error SQL al listar notificaciones:", err);
    res.status(500).json({ success: false, error: err });
  }
});
// Marcar notificación como leída
app.put("/notificaciones/:id/leido", async (req, res) => {
  const id = req.params.id;
  try {
    await dbPool.query("UPDATE notificaciones SET leido = 1 WHERE id = ?", [
      id,
    ]);
    res.json({ success: true, message: "Notificación marcada como leída" });
  } catch (err) {
    console.error("Error SQL al marcar notificación leída:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Obtener perfil de usuario
app.get("/usuario/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const [[user]] = await dbPool.query(
      "SELECT id, nombre, apellidos, email, telefono FROM usuarios WHERE id = ?",
      [usuario_id]
    );
    if (user) res.json({ success: true, user });
    else
      res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
  } catch (err) {
    console.error("Error SQL GET /usuario/:usuario_id", err);
    res.status(500).json({ success: false, error: err });
  }
});
// Actualizar perfil de usuario
app.put("/usuario/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;
  const { nombre, apellidos, email, telefono } = req.body;
  try {
    await dbPool.query(
      "UPDATE usuarios SET nombre = ?, apellidos = ?, email = ?, telefono = ? WHERE id = ?",
      [nombre, apellidos, email, telefono, usuario_id]
    );
    const [[user]] = await dbPool.query(
      "SELECT id, nombre, apellidos, email, telefono FROM usuarios WHERE id = ?",
      [usuario_id]
    );
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error SQL PUT /usuario/:usuario_id", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Iniciar servidor proxy en puerto dinámico
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy Express corriendo en http://0.0.0.0:${PORT}`);
});
