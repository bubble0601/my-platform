import { Resolvers } from "./resolvers-types";
import {
  createUserMutationResolver,
  meQueryResolver,
  userQueryResolver,
  usersQueryResolver,
} from "./user/resolvers";

export const resolvers: PickRequired<Resolvers, "Query" | "Mutation"> = {
  Query: {
    me: meQueryResolver,
    user: userQueryResolver,
    users: usersQueryResolver,
  },
  Mutation: {
    createUser: createUserMutationResolver,
  },
};
