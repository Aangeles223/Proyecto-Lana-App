const express = require("express");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
// Ensure URLSearchParams is available
const { URLSearchParams } = require("url");

// Remove proxy, add MySQL and bcrypt
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

// Configura tu conexión a MySQL
db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12358",
  database: "lana_app",
});

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "http://localhost:8000"; // FastAPI URL
const api = axios.create({ baseURL: API_URL });

// Login directo usando MySQL
app.post("/login", (req, res) => {
  const { email, contrasena } = req.body;
  if (!email || !contrasena)
    return res
      .status(400)
      .json({ success: false, message: "Email y contraseña son obligatorios" });
  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Error en el servidor" });
      if (results.length === 0)
        return res
          .status(401)
          .json({ success: false, message: "Correo o contraseña incorrectos" });
      const user = results[0];
      if (!bcrypt.compareSync(contrasena, user.contrasena))
        return res
          .status(401)
          .json({ success: false, message: "Correo o contraseña incorrectos" });
      const { contrasena: _, ...userData } = user;
      res.json({ success: true, user: userData });
    }
  );
});
// Registrar nuevo usuario directamente en MySQL
app.post("/register", (req, res) => {
  const { nombre, apellidos, email, telefono, contrasena } = req.body;
  if (!nombre || !apellidos || !email || !contrasena) {
    return res
      .status(400)
      .json({ success: false, error: "Faltan datos obligatorios" });
  }
  // Encriptar contraseña
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(contrasena, salt);
  db.query(
    "INSERT INTO usuarios (nombre, apellidos, email, telefono, contrasena) VALUES (?, ?, ?, ?, ?)",
    [nombre, apellidos, email, telefono, hash],
    (err, result) => {
      if (err) {
        console.error("Error SQL al registrar usuario:", err);
        return res.status(500).json({ success: false, error: err.message });
      }
      const id = result.insertId;
      // Devolver id del nuevo usuario
      res.status(201).json({ success: true, id });
    }
  );
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Proxy Express activo" });
});

// Usuario routes needed for login flow
// Listar usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const response = await api.get("/usuarios/");
    res.json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { success: false, error: err.message });
  }
});

// Obtener perfil de usuario directamente desde MySQL
app.get("/usuario/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT id, nombre, apellidos, email, telefono FROM usuarios WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("Error SQL al obtener usuario:", err);
        return res.status(500).json({ success: false, error: err });
      }
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }
      res.json({ success: true, user: rows[0] });
    }
  );
});
// Actualizar perfil de usuario directamente en MySQL
app.put("/usuario/:id", (req, res) => {
  const id = req.params.id;
  const { nombre, apellidos, email, telefono } = req.body;
  db.query(
    "UPDATE usuarios SET nombre = ?, apellidos = ?, email = ?, telefono = ? WHERE id = ?",
    [nombre, apellidos, email, telefono, id],
    (err, result) => {
      if (err) {
        console.error("Error SQL al actualizar usuario:", err);
        return res.status(500).json({ success: false, error: err });
      }
      // Devolver el usuario actualizado
      db.query(
        "SELECT id, nombre, apellidos, email, telefono FROM usuarios WHERE id = ?",
        [id],
        (err2, rows) => {
          if (err2) {
            console.error("Error SQL al obtener usuario actualizado:", err2);
            return res.status(500).json({ success: false, error: err2 });
          }
          res.json({ success: true, user: rows[0] });
        }
      );
    }
  );
});

// Historial de transacciones → obtener directamente de MySQL
app.get("/transacciones/historial/:usuario_id", (req, res) => {
  const usuario_id = req.params.usuario_id;
  db.query(
    `SELECT t.id, t.tipo, t.monto, t.fecha, t.descripcion, c.nombre AS categoria
     FROM transacciones t
     LEFT JOIN categorias c ON t.categoria_id = c.id
     WHERE t.usuario_id = ?
     ORDER BY t.fecha DESC`,
    [usuario_id],
    (err, rows) => {
      if (err) {
        console.error("Error SQL historial:", err);
        return res.status(500).json({ success: false, error: err });
      }
      // Map monto to cantidad (ingreso +, egreso -)
      const history = rows.map((t) => ({
        ...t,
        cantidad: t.tipo === "ingreso" ? t.monto : -t.monto,
      }));
      res.json(history);
    }
  );
});

// Listar categorías desde MySQL
app.get("/categorias", (req, res) => {
  db.query("SELECT * FROM categorias", (err, rows) => {
    if (err) {
      console.error("Error SQL al listar categorías:", err);
      return res.status(500).json({ success: false, error: err });
    }
    console.log("DB -> /categorias rows:", rows);
    res.json(rows);
  });
});

// Crear transacción en MySQL
app.post("/transacciones", (req, res) => {
  const { usuario_id, categoria_id, monto, tipo, fecha, descripcion } =
    req.body;
  db.query(
    "INSERT INTO transacciones (usuario_id, categoria_id, monto, tipo, fecha, descripcion) VALUES (?, ?, ?, ?, ?, ?)",
    [usuario_id, categoria_id, monto, tipo, fecha, descripcion],
    (err, result) => {
      if (err) {
        console.error("Error SQL al crear transacción:", err);
        return res.status(500).json({ success: false, error: err });
      }
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
    }
  );
});

// Crear presupuesto mensual
app.post("/presupuestos", (req, res) => {
  const { usuario_id, categoria_id, monto_mensual, mes, anio } = req.body;
  db.query(
    "INSERT INTO presupuestos (usuario_id, categoria_id, monto_mensual, mes, anio) VALUES (?, ?, ?, ?, ?)",
    [usuario_id, categoria_id, monto_mensual, mes, anio],
    (err, result) => {
      if (err) {
        console.error("Error SQL al crear presupuesto:", err);
        return res.status(500).json({ success: false, error: err });
      }
      res.json({ success: true, id: result.insertId });
    }
  );
});

// Obtener presupuestos mensuales para un usuario con gasto acumulado
app.get("/presupuestos/:usuario_id", (req, res) => {
  const usuario_id = req.params.usuario_id;
  const sql = `
    SELECT p.id, c.nombre AS categoria, p.monto_mensual, p.mes, p.anio,
      COALESCE(SUM(CASE WHEN t.tipo = 'ingreso' THEN t.monto ELSE -t.monto END), 0) AS gastado
    FROM presupuestos p
    JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN transacciones t
      ON t.usuario_id = p.usuario_id
      AND t.categoria_id = p.categoria_id
      AND MONTH(t.fecha) = p.mes
      AND YEAR(t.fecha) = p.anio
    WHERE p.usuario_id = ?
    GROUP BY p.id, c.nombre, p.monto_mensual, p.mes, p.anio
    ORDER BY p.anio DESC, p.mes DESC
  `;
  db.query(sql, [usuario_id], (err, rows) => {
    if (err) {
      console.error("Error SQL al listar presupuestos:", err);
      return res.status(500).json({ success: false, error: err });
    }
    res.json({ success: true, presupuestos: rows });
  });
});

// Reporte de gastos → obtener totales por categoría
app.get("/reporte/:usuario_id/:anio/:mes", (req, res) => {
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
  db.query(sql, [usuario_id, anio, mes], (err, rows) => {
    if (err) {
      console.error("Error SQL reporte de gastos:", err);
      return res.status(500).json({ success: false, error: err });
    }
    res.json({ success: true, reporte: rows });
  });
});

// Actualizar presupuesto mensual
app.put("/presupuestos/:presupuesto_id", (req, res) => {
  const { monto_mensual } = req.body;
  const id = req.params.presupuesto_id;
  db.query(
    "UPDATE presupuestos SET monto_mensual = ? WHERE id = ?",
    [monto_mensual, id],
    (err, result) => {
      if (err) {
        console.error("Error SQL al actualizar presupuesto:", err);
        return res.status(500).json({ success: false, error: err });
      }
      // Devolver el presupuesto actualizado
      db.query(
        "SELECT * FROM presupuestos WHERE id = ?",
        [id],
        (err2, rows) => {
          if (err2) {
            console.error(
              "Error SQL al obtener presupuesto actualizado:",
              err2
            );
            return res.status(500).json({ success: false, error: err2 });
          }
          res.json({ success: true, presupuesto: rows[0] });
        }
      );
    }
  );
});

// Eliminar presupuesto mensual
app.delete("/presupuestos/:presupuesto_id", (req, res) => {
  const id = req.params.presupuesto_id;
  db.query("DELETE FROM presupuestos WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error SQL al eliminar presupuesto:", err);
      return res.status(500).json({ success: false, error: err });
    }
    res.json({ success: true, deletedId: id });
  });
});

// Obtener pagos fijos de un usuario directamente desde MySQL
app.get("/pagos_fijos/usuario/:usuario_id", (req, res) => {
  const usuario_id = req.params.usuario_id;
  db.query(
    "SELECT * FROM pagos_fijos WHERE usuario_id = ?",
    [usuario_id],
    (err, rows) => {
      if (err) {
        console.error("Error SQL al listar pagos fijos por usuario:", err);
        return res.status(500).json({ success: false, error: err });
      }
      res.json({ success: true, pagos_fijos: rows });
    }
  );
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
app.post("/pagos_fijos", async (req, res) => {
  try {
    const response = await api.post("/pagos_fijos", null, { params: req.body });
    res.json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { success: false, message: err.message });
  }
});

// Proxy DELETE pagos fijos a FastAPI
// Actualizar pago fijo directamente en MySQL
app.put("/pagos_fijos/:pago_id", (req, res) => {
  const id = req.params.pago_id;
  const { servicio_id, nombre, monto, categoria_id, dia_pago, activo, pagado } =
    req.body;
  db.query(
    `UPDATE pagos_fijos SET servicio_id = ?, nombre = ?, monto = ?, categoria_id = ?, dia_pago = ?, activo = ?, pagado = ? WHERE id = ?`,
    [servicio_id, nombre, monto, categoria_id, dia_pago, activo, pagado, id],
    (err, result) => {
      if (err) {
        console.error("Error SQL al actualizar pago fijo:", err);
        return res.status(500).json({ success: false, error: err });
      }
      res.json({ success: true, updatedId: id });
    }
  );
});

// Eliminar pago fijo directamente en MySQL
app.delete("/pagos_fijos/:pago_id", (req, res) => {
  const id = req.params.pago_id;
  db.query("DELETE FROM pagos_fijos WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error SQL al eliminar pago fijo:", err);
      return res.status(500).json({ success: false, error: err });
    }
    res.json({ success: true, deletedId: id });
  });
});

// Listar servicios desde MySQL
app.get("/servicios", (req, res) => {
  db.query("SELECT * FROM servicios", (err, rows) => {
    if (err) {
      console.error("Error SQL al listar servicios:", err);
      return res.status(500).json({ success: false, error: err });
    }
    res.json(rows);
  });
});

// Iniciar servidor proxy en puerto dinámico
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy Express corriendo en http://0.0.0.0:${PORT}`);
});
