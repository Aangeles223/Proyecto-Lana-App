// backend-lana-app/index.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs"); // <-- AGREGA ESTA LÍNEA

const app = express();
app.use(express.json());
app.use(cors());

// Configura tu conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12358",
  database: "lana_app",
});

// REGISTRO DE USUARIOS
// backend-lana-app/index.js
app.post("/register", (req, res) => {
  console.log("Petición recibida en /register:", req.body);
  const { nombre, apellidos, email, contrasena, telefono } = req.body;
  console.log("Valor de contrasena:", contrasena); // <-- Agrega esto

  if (!contrasena) {
    return res
      .status(400)
      .json({ success: false, message: "La contraseña es obligatoria" });
  }

  // Encriptar la contraseña antes de guardar
  const hash = bcrypt.hashSync(contrasena, 10);

  db.query(
    "INSERT INTO usuarios (nombre, apellidos, email, contrasena, telefono, fecha_creacion) VALUES (?, ?, ?, ?, ?, NOW())",
    [nombre, apellidos, email, hash, telefono],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          console.log("Correo duplicado");
          return res.json({
            success: false,
            message: "El correo ya está registrado",
          });
        }
        console.log("Error SQL:", err);
        return res.status(500).json({ success: false, error: err });
      }
      console.log("Usuario insertado:", result.insertId);
      res.json({ success: true, id: result.insertId });
    }
  );
});
// REGISTRO DE USUARIOS

// INICIAR SESION
app.post("/login", (req, res) => {
  console.log("Petición recibida en /login:", req.body);
  const { email, contrasena } = req.body;
  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.log("Error SQL:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error en el servidor" });
      }
      if (results.length === 0) {
        console.log("No existe el usuario");
        return res.json({
          success: false,
          message: "Correo o contraseña incorrectos",
        });
      }
      const user = results[0];
      console.log("Usuario encontrado:", user);
      console.log("Comparando:", contrasena, user.contrasena);
      if (!require("bcryptjs").compareSync(contrasena, user.contrasena)) {
        console.log("Contraseña incorrecta");
        return res.json({
          success: false,
          message: "Correo o contraseña incorrectos",
        });
      }
      console.log("Login exitoso");
      res.json({
        success: true,
        user: { id: user.id, nombre: user.nombre, email: user.email },
      });
    }
  );
});
// INICIAR SESION

// Obtener transacciones y saldo de un usuario
app.get("/usuario/:id/resumen", (req, res) => {
  const usuario_id = req.params.id;
  // 1. Obtener las últimas 10 transacciones con nombre de categoría
  db.query(
    `SELECT t.id, t.tipo, t.monto, t.fecha, t.descripcion, c.nombre AS categoria
     FROM transacciones t
     LEFT JOIN categorias c ON t.categoria_id = c.id
     WHERE t.usuario_id = ?
     ORDER BY t.fecha DESC, t.id DESC
     LIMIT 10`,
    [usuario_id],
    (err, transacciones) => {
      if (err) return res.status(500).json({ success: false, error: err });

      // 2. Calcular el saldo total
      db.query(
        `SELECT 
            SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) AS saldo
         FROM transacciones
         WHERE usuario_id = ?`,
        [usuario_id],
        (err2, saldoResult) => {
          if (err2)
            return res.status(500).json({ success: false, error: err2 });

          res.json({
            success: true,
            saldo: saldoResult[0].saldo || 0,
            transacciones: transacciones.map((t) => ({
              ...t,
              cantidad: t.tipo === "ingreso" ? t.monto : -t.monto,
            })),
          });
        }
      );
    }
  );
});
// Obtener transacciones y saldo de un usuario

// Ayuda
app.get("/ayuda/info", (req, res) => {
  db.query("SELECT * FROM ayuda LIMIT 1", (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, info: results[0] });
  });
});
// Ayuda

app.get("/usuario/:id", (req, res) => {
  const usuario_id = req.params.id;
  db.query(
    "SELECT id, nombre, apellidos, email, telefono FROM usuarios WHERE id = ?",
    [usuario_id],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err });
      if (results.length === 0)
        return res.json({ success: false, message: "Usuario no encontrado" });
      res.json({ success: true, user: results[0] });
    }
  );
});

app.put("/usuario/:id", (req, res) => {
  const usuario_id = req.params.id;
  const { nombre, apellidos, email, telefono } = req.body;
  db.query(
    "UPDATE usuarios SET nombre = ?, apellidos = ?, email = ?, telefono = ? WHERE id = ?",
    [nombre, apellidos, email, telefono, usuario_id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });
      res.json({ success: true });
    }
  );
});

app.post("/transacciones", (req, res) => {
  const { usuario_id, tipo, categoria_id, monto, fecha, descripcion } =
    req.body;
  db.query(
    "INSERT INTO transacciones (usuario_id, tipo, categoria_id, monto, fecha, descripcion) VALUES (?, ?, ?, ?, ?, ?)",
    [usuario_id, tipo, categoria_id, monto, fecha, descripcion],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });
      res.json({ success: true, id: result.insertId });
    }
  );
});

app.get("/categorias", (req, res) => {
  db.query("SELECT id, nombre FROM categorias", (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, categorias: results });
  });
});

app.get("/servicios", (req, res) => {
  db.query("SELECT id, nombre, descripcion FROM servicios", (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, servicios: results });
  });
});

app.get("/presupuestos/:usuario_id", (req, res) => {
  const usuario_id = req.params.usuario_id;
  // Trae el presupuesto, nombre de la categoría y gasto acumulado del mes
  db.query(
    `SELECT p.id, p.categoria_id, c.nombre AS categoria, p.monto_mensual, p.mes, p.anio,
      IFNULL(SUM(t.monto), 0) AS gastado
     FROM presupuestos p
     JOIN categorias c ON p.categoria_id = c.id
     LEFT JOIN transacciones t
       ON t.categoria_id = p.categoria_id
       AND t.usuario_id = p.usuario_id
       AND t.tipo = 'egreso'
       AND MONTH(t.fecha) = p.mes
       AND YEAR(t.fecha) = p.anio
     WHERE p.usuario_id = ?
     GROUP BY p.id, p.categoria_id, c.nombre, p.monto_mensual, p.mes, p.anio
     ORDER BY p.mes DESC, p.anio DESC, c.nombre ASC`,
    [usuario_id],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err });
      res.json({ success: true, presupuestos: results });
    }
  );
});

app.post("/presupuestos", (req, res) => {
  const { usuario_id, categoria_id, monto_mensual, mes, anio, periodo } =
    req.body;
  db.query(
    "INSERT INTO presupuestos (usuario_id, categoria_id, monto_mensual, mes, anio) VALUES (?, ?, ?, ?, ?)",
    [usuario_id, categoria_id, monto_mensual, mes, anio],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });
      res.json({ success: true, id: result.insertId });
    }
  );
});

// backend-lana-app/index.js
app.put("/presupuestos/:id", (req, res) => {
  const { monto_mensual } = req.body;
  const id = req.params.id;
  db.query(
    "UPDATE presupuestos SET monto_mensual = ? WHERE id = ?",
    [monto_mensual, id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });
      res.json({ success: true });
    }
  );
});

// backend-lana-app/index.js
// Reporte por mes y año (puedes adaptar para semana)
app.get("/reporte/:usuario_id/:anio/:mes", (req, res) => {
  const { usuario_id, anio, mes } = req.params;
  db.query(
    `
    SELECT 
      c.nombre AS categoria,
      SUM(CASE WHEN t.tipo = 'ingreso' THEN t.monto ELSE 0 END) AS ingresos,
      SUM(CASE WHEN t.tipo = 'egreso' THEN t.monto ELSE 0 END) AS egresos
    FROM transacciones t
    JOIN categorias c ON t.categoria_id = c.id
    WHERE t.usuario_id = ? AND YEAR(t.fecha) = ? AND MONTH(t.fecha) = ?
    GROUP BY c.nombre
    `,
    [usuario_id, anio, mes],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err });
      console.log("Reporte resultados:", results); // <-- Agrega esto
      res.json({ success: true, reporte: results });
    }
  );
});

//Ruta para obtener pagos fijos de un usuario
app.get("/pagos-fijos/:usuario_id", (req, res) => {
  const usuario_id = req.params.usuario_id;

  const sql = `
    SELECT 
      id,
      servicio_id,
      nombre,
      monto,
      categoria_id,
      dia_pago,
      pagado,
      ultima_fecha
    FROM pagos_fijos
    WHERE usuario_id = ? AND activo = 1
  `;

  db.query(sql, [usuario_id], (err, results) => {
    if (err) {
      console.error("❌ Error al consultar pagos fijos:", err);
      return res.status(500).json({ success: false, error: err });
    }

    res.json({ success: true, pagos: results });
  });
});

// Ruta para agregar un nuevo pago fijo
app.post("/pagos-fijos", (req, res) => {
  const {
    usuario_id,
    servicio_id,
    categoria_id,
    nombre,
    monto,
    dia_pago,
    activo = 1,
    pagado = 0,
    ultima_fecha = null,
  } = req.body;

  if (
    !usuario_id ||
    !servicio_id ||
    !categoria_id ||
    !nombre ||
    monto === undefined ||
    dia_pago === undefined
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Faltan datos obligatorios (usuario_id, servicio_id, categoria_id, nombre, monto, dia_pago)",
    });
  }

  const sql = `
    INSERT INTO pagos_fijos (usuario_id, servicio_id, categoria_id, nombre, monto, dia_pago, activo, pagado, ultima_fecha)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [usuario_id, servicio_id, categoria_id, nombre, monto, dia_pago, activo, pagado, ultima_fecha],
    (err, result) => {
      if (err) {
        console.error("Error al insertar pago fijo:", err);
        return res.status(500).json({ success: false, error: err });
      }
      res.json({
        success: true,
        id: result.insertId,
        message: "Pago fijo creado correctamente",
      });
    }
  );
});

// Ruta para actualizar un pago fijo
app.put("/pagos-fijos/:id", (req, res) => {
  const pagoId = req.params.id;
  const {
    usuario_id,
    servicio_id,
    categoria_id,
    nombre,
    monto,
    dia_pago,
    activo = 1,
    pagado = 0,
    ultima_fecha = null,
  } = req.body;

  if (
    !usuario_id ||
    !servicio_id ||
    !categoria_id ||
    !nombre ||
    monto === undefined ||
    dia_pago === undefined
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Faltan datos obligatorios (usuario_id, servicio_id, categoria_id, nombre, monto, dia_pago)",
    });
  }

  const sql = `
    UPDATE pagos_fijos
    SET usuario_id = ?, servicio_id = ?, categoria_id = ?, nombre = ?, monto = ?, dia_pago = ?, activo = ?, pagado = ?, ultima_fecha = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [usuario_id, servicio_id, categoria_id, nombre, monto, dia_pago, activo, pagado, ultima_fecha, pagoId],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar pago fijo:", err);
        return res.status(500).json({ success: false, error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Pago fijo no encontrado" });
      }
      res.json({
        success: true,
        message: "Pago fijo actualizado correctamente",
      });
    }
  );
});


// 🚀 Levantar el servidor
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🟢 API corriendo en http://0.0.0.0:${PORT}`);
});
