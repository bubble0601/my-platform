type Ok<T> = {
  ok: true;
  data: T;
};

type Err<E> = {
  ok: false;
  error: E;
};

export type Result<T, E> = Ok<T> | Err<E>;
export function ok<T>(data: T): Result<T, never>;
export function ok(): Result<undefined, never>;
export function ok<T>(data?: T): Result<T, never> {
  return {
    ok: true,
    data: data as T,
  };
}
export const err = <const E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.ok) {
    return result.data;
  }
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw result.error;
};
export const unwrapOr = <T, E>(result: Result<T, E>, value: T): T =>
  result.ok ? result.data : value;
export const map = <T, E, U>(
  result: Result<T, E>,
  fn: (data: T) => U,
): Result<U, E> => (result.ok ? ok(fn(result.data)) : result);
export const compose = <T extends Array<Result<unknown, unknown>>>(
  ...results: T
): Result<
  {
    [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never;
  },
  {
    [K in keyof T]: T[K] extends Result<unknown, infer U> ? U : never;
  }[number]
> => {
  const acc: unknown[] = [];
  for (const result of results) {
    if (!result.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return err(result.error as any);
    }
    acc.push(result.data);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ok(acc as any);
};

// const r1 = compose(ok(1), ok(2), ok(3)); // ok([1, 2, 3])
// const r2 = compose(ok(1), err("error"), ok(3)); // err(["error"])
// const r3 = compose(ok(1), err("error1"), err("error2")); // err(["error1", "error2"])
// const r4 = compose(ok(1), err("error1"), err(2)); // err(["error1", 2])
