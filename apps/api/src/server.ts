import { useGenericAuth } from "@envelop/generic-auth";
import {
  EmailAddressResolver,
  EmailAddressTypeDefinition,
} from "graphql-scalars";
import { createSchema, createYoga } from "graphql-yoga";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { resolvers } from "~/schema/resolvers";
import type { BaseContext } from "./context";
import { closeDb, db } from "./db";
import { resolveUserFn } from "./utils/auth";
import { env } from "./utils/env";

const typeDefs = readFileSync(
  path.resolve(__dirname, "./schema/schema.gql"),
  "utf8",
);

export const createYogaServer = () => {
  const schema = createSchema<BaseContext>({
    typeDefs: [EmailAddressTypeDefinition, typeDefs],
    resolvers: {
      EmailAddress: EmailAddressResolver,
      ...resolvers,
    },
  });

  const yoga = createYoga({
    schema,
    context: (ctx): BaseContext => ({
      ...ctx,
      db,
    }),
    plugins: [
      useGenericAuth({
        resolveUserFn,
        mode: "protect-all",
      }),
    ],
  });

  return yoga;
};

export const startServer = () => {
  const yoga = createYogaServer();

  const server = createServer(yoga);

  server.listen(env.PORT, () => {
    console.info(`Server is running on http://localhost:${env.PORT}/graphql`);
    process.send?.("ready");
  });

  process.on("SIGINT", async () => {
    console.log("Received SIGINT signal. Exiting gracefully...");
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
    await closeDb();
    process.exit(0);
  });
};
