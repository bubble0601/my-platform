export const isTruthy = <T>(
  x: T,
): x is Exclude<T, null | undefined | false | 0 | 0n | ""> => Boolean(x);
