"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { graphql } from "~/_gql";
import { err, ok } from "~/_utils/result";
import { env, publicClient } from "~/_utils/server";

const createUserDocument = graphql(`
  mutation CreateUser($email: EmailAddress!, $sub: String!) {
    createUser(data: { email: $email, sub: $sub }) {
      user {
        id
        name
      }
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
    return err({ errors: [signUpResult.error] });
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
  const errors = [signInResult.error, createUserResult.error].filter(Boolean);

  return errors.length > 0 ? err({ errors }) : ok();
};
