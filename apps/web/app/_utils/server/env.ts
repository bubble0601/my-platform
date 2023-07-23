import { envsafe, str, url } from "envsafe";
import "server-only";

export const env = envsafe({
  NODE_ENV:
    /** @type {import("envsafe").ValidatorSpec<'development' | 'test' | 'production'>} */
    str({
      devDefault: "development",
      choices: ["development", "test", "production"],
    }),
  APP_NAME: str({
    default: "My App",
  }),
  API_URL: url({
    default: "http://localhost:8080/graphql",
  }),
  NEXT_PUBLIC_SUPABASE_URL: url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: str(),
  SUPABASE_SERVICE_KEY: str(),
});

export const isProduction = env.NODE_ENV === "production";
