// for GraphQL resolver types
import type { Selectable } from "kysely";
import type { User } from "./types";

export type UserModel = Selectable<User>;
