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
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      lcsin VARCHAR(10) NOT NULL UNIQUE,
      asin VARCHAR(32) NULL,
      sku VARCHAR(120) NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const [settingRows] = await pool.query("SELECT id FROM settings LIMIT 1");

  if (Array.isArray(settingRows) && settingRows.length === 0) {
    await pool.query(
      `INSERT INTO settings (app_name, backend_app_url, storage_location_url)
       VALUES (?, ?, ?)`,
      ["limncreartion-local", backendUrl, ""],
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
