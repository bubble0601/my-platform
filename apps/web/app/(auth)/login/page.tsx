import { getSession } from "~/_utils/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();

  return (
    <div>
      <h1>Login</h1>
      <LoginForm session={session} />
    </div>
  );
}
