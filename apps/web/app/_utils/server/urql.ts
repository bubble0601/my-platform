import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Client, fetchExchange } from "@urql/core";
import { cookies } from "next/headers";
import "server-only";
import { env } from "./env";

export const publicClient = new Client({
  url: env.API_URL,
  exchanges: [fetchExchange],
});

export const getAuthedClient = async () => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log({ session });
  if (session == null) {
    throw new Error("Unauthenticated");
  }

  return new Client({
    url: env.API_URL,
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
    exchanges: [fetchExchange],
  });
};
