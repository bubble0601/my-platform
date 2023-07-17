import { envsafe, str, url } from "envsafe";
import "server-only";

export const env = envsafe({
  NODE_ENV:
    /** @type {import("envsafe").ValidatorSpec<'development' | 'test' | 'production'>} */
    str({
      devDefault: "development",
      choices: ["development", "test", "production"],
    }),
  API_URL: url({
    devDefault: "http://localhost:8080",
  }),
  NEXT_PUBLIC_SUPABASE_URL: url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: str(),
  SUPABASE_SERVICE_KEY: str(),
});

export const isProduction = env.NODE_ENV === "production";
