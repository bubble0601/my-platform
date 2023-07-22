import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { env } from "~/utils/env";
import { DB } from "./types";

const pool = new Pool({
  database: env.DB_NAME,
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  max: 10,
});

const dialect = new PostgresDialect({
  pool,
});

export const db = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
});

export const closeDb = async () => {
  await pool.end();
};
