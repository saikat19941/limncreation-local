import mysql from "mysql2/promise";

import { env } from "@/lib/env";

type SqlValue =
  | Date
  | boolean
  | null
  | number
  | string
  | Uint8Array;

const globalForDb = globalThis as typeof globalThis & {
  limnCreationPool?: mysql.Pool;
};

export const pool =
  globalForDb.limnCreationPool ??
  mysql.createPool({
    database: env.dbDatabase,
    host: env.dbHost,
    namedPlaceholders: false,
    password: env.dbPassword,
    port: env.dbPort,
    user: env.dbUser,
    waitForConnections: true,
  });

if (!globalForDb.limnCreationPool) {
  globalForDb.limnCreationPool = pool;
}

export async function queryRows<T>(sql: string, values: SqlValue[] = []) {
  const [rows] = await pool.query(sql, values);
  return rows as T[];
}

export async function queryOne<T>(sql: string, values: SqlValue[] = []) {
  const rows = await queryRows<T>(sql, values);
  return rows[0] ?? null;
}

export async function execute(sql: string, values: SqlValue[] = []) {
  const [result] = await pool.execute(sql, values);
  return result;
}
