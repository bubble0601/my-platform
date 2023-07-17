import { envsafe, str, url } from "envsafe";

export const env = envsafe({
  NODE_ENV:
    /** @type {import("envsafe").ValidatorSpec<'development' | 'test' | 'production'>} */
    str({
      devDefault: "development",
      choices: ["development", "test", "production"],
    }),
  NEXT_PUBLIC_SUPABASE_URL: url({
    input: process.env.NEXT_PUBLIC_SUPABASE_URL,
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: str({
    input: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }),
});

export const isProduction = env.NODE_ENV === "production";
