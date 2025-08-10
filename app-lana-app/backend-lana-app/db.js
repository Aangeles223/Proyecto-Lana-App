// db.js
const mysql = require("mysql2/promise");

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Master12$",
  database: "lana_app",
};

// Crear un pool de conexiones reutilizable
const db = mysql.createPool(dbConfig);

module.exports = db;
