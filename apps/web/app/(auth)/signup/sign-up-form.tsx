"use client";

import type { Session } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import type { SyntheticEvent } from "react";
import { useId, useRef } from "react";
import { supabase } from "~/_utils/client";
import { handleError } from "~/_utils/error";
import { signUp } from "../actions";

type Props = {
  session: Session | null;
};

export const SignUpForm = ({ session }: Props) => {
  const router = useRouter();
  const emailInputId = useId();
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInputId = useId();
  const passwordInput = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailInput.current || !passwordInput.current) return;

    const result = await signUp(
      emailInput.current.value,
      passwordInput.current.value,
    );
    if (result.errors.length > 0) {
      handleError(result.errors);
      return;
    }
    router.push("/signup/success");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (session) {
    return (
      <div>
        <h1>ログイン済み</h1>
        <p>ログインメールアドレス: {session.user.email}</p>
        <button type="button" onClick={handleSignOut}>
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor={emailInputId}>メールアドレス</label>
        <input ref={emailInput} id={emailInputId} type="email" name="email" />
      </div>
      <div>
        <label htmlFor={passwordInputId}>パスワード</label>
        <input
          ref={passwordInput}
          id={passwordInputId}
          type="password"
          name="password"
        />
      </div>
      <div>
        <input type="submit" value="登録" />
      </div>
    </form>
  );
};
