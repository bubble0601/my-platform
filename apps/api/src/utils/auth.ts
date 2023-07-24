import type { ResolveUserFn } from "@envelop/generic-auth";
import type { JwtPayload } from "jsonwebtoken";
import { verify } from "jsonwebtoken";
import type { Selectable } from "kysely";
import type { BaseContext } from "~/context";
import { db } from "~/db";
import type { User } from "~/db/types";
import { env } from "./env";

export type UserType = Selectable<User>;

export const resolveUserFn: ResolveUserFn<UserType, BaseContext> = async (
  context,
) => {
  try {
    const token = context.request.headers
      .get("Authorization")
      ?.split(" ")
      .pop();
    if (token == null) throw new Error("No token provided");

    const payload = verify(token, env.SUPABASE_JWT_SECRET) as JwtPayload;
    if (payload.sub == null) throw new Error("No sub in token");

    return db
      .selectFrom("users")
      .where("sub", "=", payload.sub)
      .selectAll()
      .executeTakeFirst();
  } catch {
    return null;
  }
};
