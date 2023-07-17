import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { LoginForm } from "./login-form";

const LoginPage = async () => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <div>
      <h1>Login</h1>
      <LoginForm session={session} />
    </div>
  );
};

export default LoginPage;
