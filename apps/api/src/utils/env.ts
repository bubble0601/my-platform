import type { ValidatorSpec } from "envsafe";
import { envsafe, port, str } from "envsafe";

export const env = envsafe({
  NODE_ENV: str({
    devDefault: "development",
    choices: ["development", "test", "production"],
  }) as ValidatorSpec<"development" | "test" | "production">,
  PORT: port({
    default: 8080,
  }),
  DB_HOST: str(),
  DB_PORT: port(),
  DB_USER: str(),
  DB_PASSWORD: str({
    allowEmpty: true,
  }),
  DB_NAME: str(),
  DATABASE_URL: str(),
  SUPABASE_JWT_SECRET: str(),
});

export const isProduction = env.NODE_ENV === "production";
