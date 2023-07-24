import type { ValidateUserFn } from "@envelop/generic-auth";
import type { YogaInitialContext } from "graphql-yoga";
import type { db as database } from "./db";
import type { UserType } from "./utils/auth";

export interface BaseContext extends YogaInitialContext {
  db: typeof database;
}

export type Context = BaseContext & {
  currentUser: UserType | null | undefined;
  validateUser: ValidateUserFn<UserType>;
};
