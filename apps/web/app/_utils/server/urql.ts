import { Client, fetchExchange } from "@urql/core";
import "server-only";
import { env } from "./env";
import { getSession } from "./session";

export const publicClient = new Client({
  url: env.API_URL,
  exchanges: [fetchExchange],
});

export const getAuthedClient = async () => {
  const session = await getSession();

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
