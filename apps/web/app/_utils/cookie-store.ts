import * as cookieStorePollyfill from "cookie-store";

export const cookieStore =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  window.cookieStore ?? cookieStorePollyfill.cookieStore;
