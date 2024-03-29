import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { env } from "./env";

export const supabase = createClientComponentClient({
  supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
