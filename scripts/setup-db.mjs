import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  password: process.env.DB_PASSWORD ?? "",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  waitForConnections: true,
});

const databaseName = process.env.DB_DATABASE ?? "limncreation_local";
const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const toastColumns = [
  "ADD COLUMN IF NOT EXISTS toast_enabled TINYINT(1) NOT NULL DEFAULT 1",
  "ADD COLUMN IF NOT EXISTS toast_placement VARCHAR(24) NOT NULL DEFAULT 'bottom end'",
  "ADD COLUMN IF NOT EXISTS toast_timeout_ms INT UNSIGNED NOT NULL DEFAULT 5000",
  "ADD COLUMN IF NOT EXISTS toast_max_visible TINYINT UNSIGNED NOT NULL DEFAULT 3",
];

async function setup() {
  await pool.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
  await pool.query(`USE \`${databaseName}\``);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      app_name VARCHAR(150) NOT NULL,
      backend_app_url VARCHAR(255) NOT NULL,
      storage_location_url VARCHAR(500) NOT NULL DEFAULT '',
      product_delete_protection TINYINT(1) NOT NULL DEFAULT 0,
      toast_enabled TINYINT(1) NOT NULL DEFAULT 1,
      toast_placement VARCHAR(24) NOT NULL DEFAULT 'bottom end',
      toast_timeout_ms INT UNSIGNED NOT NULL DEFAULT 5000,
      toast_max_visible TINYINT UNSIGNED NOT NULL DEFAULT 3,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS product_delete_protection TINYINT(1) NOT NULL DEFAULT 0
  `);

  for (const column of toastColumns) {
    await pool.query(`ALTER TABLE settings ${column}`);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      lcsin VARCHAR(12) NOT NULL UNIQUE,
      asin VARCHAR(32) NULL,
      sku VARCHAR(120) NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE products
    MODIFY lcsin VARCHAR(12) NOT NULL
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      type ENUM('info', 'success', 'warning', 'danger') NOT NULL DEFAULT 'info',
      title VARCHAR(190) NOT NULL,
      message TEXT NULL,
      action_url VARCHAR(500) NULL,
      created_by INT UNSIGNED NULL,
      read_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_notifications_read_created (read_at, created_at),
      INDEX idx_notifications_created (created_at),
      CONSTRAINT fk_notifications_created_by
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE SET NULL
    )
  `);

  const [settingRows] = await pool.query("SELECT id FROM settings LIMIT 1");

  if (Array.isArray(settingRows) && settingRows.length === 0) {
    await pool.query(
      `INSERT INTO settings (
         app_name,
         backend_app_url,
         storage_location_url,
         product_delete_protection,
         toast_enabled,
         toast_placement,
         toast_timeout_ms,
         toast_max_visible
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ["limncreartion-local", backendUrl, "", 0, 1, "bottom end", 5000, 3],
    );
  }

  console.log(`Database setup complete for ${databaseName}.`);
  await pool.end();
}

setup().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
