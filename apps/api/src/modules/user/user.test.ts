import { afterEach, expect, test } from "vitest";
import { db } from "~/db";
import { createYogaServer } from "~/server";

const yoga = createYogaServer();

const gql = (strings: TemplateStringsArray) =>
  JSON.stringify({
    extensions: {},
    query: strings.join(""),
  });

afterEach(async () => {
  await db.deleteFrom("users").execute();
});

test("create user", async () => {
  const res = await yoga.fetch(
    new Request("http://yoga/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: gql`
        mutation {
          createUser(
            data: { email: "email@example.com", name: "bubble", sub: "uuid" }
          ) {
            id
          }
        }
      `,
    }),
  );

  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({
    data: expect.any(Object),
  });
  expect(
    await db.selectFrom("users").where("sub", "=", "uuid").executeTakeFirst(),
  ).toBeDefined();
});

test("create user with invalid email", async () => {
  const res = await yoga.fetch(
    new Request("http://yoga/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: gql`
        mutation {
          createUser(
            data: { email: "invalid email", name: "bubble", sub: "uuid" }
          ) {
            id
          }
        }
      `,
    }),
  );

  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({
    errors: expect.arrayContaining([expect.any(Object)]),
  });
});
