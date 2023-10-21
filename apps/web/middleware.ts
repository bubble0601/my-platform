import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (
    session == null &&
    /^\/(?!api|_next\/static|_next\/image|favicon.ico|auth|login|signup).+/.test(
      req.nextUrl.pathname,
    )
  ) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${req.nextUrl.pathname}`, req.nextUrl),
    );
  }

  return res;
}
