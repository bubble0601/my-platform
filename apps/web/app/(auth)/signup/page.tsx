import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { SignUpForm } from "./sign-up-form";

const SignUpPage = async () => {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <div>
      <h1>Sign up</h1>
      <SignUpForm session={session} />
    </div>
  );
};

export default SignUpPage;
