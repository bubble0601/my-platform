"use client";

import { Button } from "@internal/ui";
import type { Session } from "@supabase/auth-helpers-nextjs";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useId, useRef } from "react";
import { supabase } from "~/_utils/client";

type Props = {
  session: Session | null;
};

export const LoginForm = ({ session }: Props) => {
  const router = useRouter();
  const emailInputId = useId();
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInputId = useId();
  const passwordInput = useRef<HTMLInputElement>(null);
  const params = useSearchParams();
  const unsafeRedirectURL = params.get("redirect");
  const redirectURL =
    unsafeRedirectURL?.startsWith("/") === true
      ? (unsafeRedirectURL as Route)
      : null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailInput.current || !passwordInput.current) return;

    const result = await supabase.auth.signInWithPassword({
      email: emailInput.current.value,
      password: passwordInput.current.value,
    });
    if (result.data.user) {
      router.push(redirectURL ?? "/");
    }
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
        <Button type="submit" onClick={handleSignOut}>
          ログアウト
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor={emailInputId}>メールアドレス</label>
        <input
          ref={emailInput}
          id={emailInputId}
          type="email"
          name="email"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
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
        <Button type="submit">ログイン</Button>
      </div>
    </form>
  );
};

export default LoginForm;
