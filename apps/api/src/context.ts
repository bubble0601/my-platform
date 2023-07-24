import { ValidateUserFn } from "@envelop/generic-auth";
import { YogaInitialContext } from "graphql-yoga";
import { db as database } from "./db";
import { UserType } from "./utils/auth";

export interface BaseContext extends YogaInitialContext {
  db: typeof database;
}

export type Context = BaseContext & {
  currentUser: UserType | null | undefined;
  validateUser: ValidateUserFn<UserType>;
};
