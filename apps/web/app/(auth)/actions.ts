"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { graphql } from "~/_gql";
import { env, publicClient } from "~/_utils/server";

const createUserDocument = graphql(`
  mutation CreateUser($email: EmailAddress!, $sub: String!) {
    createUser(data: { email: $email, sub: $sub }) {
      ok
    }
  }
`);

const supabase = createServerActionClient(
  {
    cookies,
  },
  {
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: env.SUPABASE_SERVICE_KEY,
  },
);

export const signUp = async (email: string, password: string) => {
  const signUpResult = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (signUpResult.error) {
    return {
      errors: [signUpResult.error],
    };
  }

  const { user } = signUpResult.data;
  const { id: sub } = user;

  const [signInResult, createUserResult] = await Promise.all([
    supabase.auth.signInWithPassword({
      email,
      password,
    }),
    publicClient.mutation(createUserDocument, { email, sub }).toPromise(),
  ]);

  return {
    errors: [signInResult.error, createUserResult.error].filter(Boolean),
  };
};
