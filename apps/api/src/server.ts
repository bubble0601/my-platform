import { readFileSync } from "fs";
import { createServer } from "http";
import { resolve } from "path";
import { useGenericAuth } from "@envelop/generic-auth";
import {
  EmailAddressTypeDefinition,
  EmailAddressResolver,
} from "graphql-scalars";
import { createSchema, createYoga } from "graphql-yoga";
import { resolvers } from "~/schema/resolvers";
import { BaseContext } from "./context";
import { db } from "./db";
import { resolveUserFn } from "./utils/auth";
import { env } from "./utils/env";

const typeDefs = readFileSync(
  resolve(__dirname, "./schema/generated.gql"),
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
  });
};
