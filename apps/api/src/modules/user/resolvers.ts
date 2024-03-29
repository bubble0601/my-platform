import type { UserModule } from "./module-types";

export const userQueryResolvers: UserModule.QueryResolvers = {
  me: (_, __, context) => {
    return context.currentUser ?? null;
  },
  user: async (_, args, context) => {
    const { id } = args;
    const { db } = context;
    const user = await db
      .selectFrom("users")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();
    return user ?? null;
  },
  users: async (_, __, context) => {
    const { db } = context;
    const users = await db.selectFrom("users").selectAll().execute();
    return users;
  },
};

export const userMutationResolvers: UserModule.MutationResolvers = {
  createUser: async (_, args, context) => {
    const { data } = args;
    const { db } = context;
    const user = await db
      .insertInto("users")
      .values({
        updatedAt: new Date(),
        sub: data.sub,
        name: data.name ?? data.email,
        email: data.email,
      })
      .returningAll()
      .executeTakeFirst();
    if (user == null) {
      throw new Error("Failed to create user");
    }

    return {
      user,
    };
  },
};
