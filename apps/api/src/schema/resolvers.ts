import { userMutationResolvers, userQueryResolvers } from "~/modules/user";
import type { Resolvers } from "./types";

export const resolvers: Pick<Resolvers, "Query" | "Mutation"> = {
  Query: {
    ...userQueryResolvers,
  },
  Mutation: {
    ...userMutationResolvers,
  },
};
