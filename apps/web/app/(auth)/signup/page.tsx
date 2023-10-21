import { getSession } from "~/_utils/server";
import { SignUpForm } from "./sign-up-form";

export default async function SignUpPage() {
  const session = await getSession();
  
  return (
    <div>
      <h1>Sign up</h1>
      <SignUpForm session={session} />
    </div>
  );
}
