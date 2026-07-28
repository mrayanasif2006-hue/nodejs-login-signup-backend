
const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

//.env
const dbPath = path.isAbsolute(process.env.DB_PATH || "")
    ? process.env.DB_PATH
    : path.join(__dirname, "..", process.env.DB_PATH || "data/app.db");

const db = new Database(dbPath);

// Create the users table if it does not exist yet.
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        name     TEXT,
        email    TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role     TEXT NOT NULL DEFAULT 'user'
    )
`);

// Seed a default admin account (only inserted if it doesn't already exist).
const adminName = process.env.ADMIN_NAME || "Admin";
const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
const adminPassword = process.env.ADMIN_PASSWORD || "123456";



db.prepare(
    `INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`
).run(adminName, adminEmail, bcrypt.hashSync(adminPassword, 10), "admin");

module.exports = db;
