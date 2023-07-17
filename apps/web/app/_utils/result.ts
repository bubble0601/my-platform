interface IResult<T, E> {
  isOk(): this is Ok<T, E>;
  isErr(): this is Err<T, E>;
  map<U>(fn: (value: T) => U): Result<U, E>;
  unwrap(): T;
  expect(message: string): T;
  unwrapOr(value: T): T;
}

class Ok<T, E> implements IResult<T, E> {
  constructor(public readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true;
  }
  isErr(): this is Err<T, E> {
    return false;
  }
  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Ok(fn(this.value));
  }
  unwrap(): T {
    return this.value;
  }
  expect(_message: string): T {
    return this.value;
  }
  unwrapOr(_value: T): T {
    return this.value;
  }
}

class Err<T, E> implements IResult<T, E> {
  constructor(public readonly error: E) {}

  isOk(): this is Ok<T, E> {
    return false;
  }
  isErr(): this is Err<T, E> {
    return true;
  }
  map<U>(_fn: (value: T) => U): Result<U, E> {
    return new Err(this.error);
  }
  unwrap(): never {
    throw this.error;
  }
  expect(message: string): never {
    throw new Error(message, {
      cause: this.error,
    });
  }
  unwrapOr(value: T): T {
    return value;
  }
}

export type Result<T, E> = Ok<T, E> | Err<T, E>;
export const ok = <T, E = never>(value: T): Result<T, E> => new Ok(value);
export const err = <T = never, E = unknown>(error: E): Result<T, E> =>
  new Err(error);
export const compose = <T extends Result<unknown, unknown>[]>(
  ...results: T
): Result<
  {
    [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never;
  },
  {
    [K in keyof T]: T[K] extends Result<unknown, infer U> ? U : never;
  }[number]
> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return results.reduce<Result<unknown[], unknown>>((acc, result) => {
    if (acc.isErr()) {
      return acc;
    }
    if (result.isErr()) {
      return err(result.error);
    }
    return ok([...acc.value, result.unwrap()]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, ok([])) as any;
};

// const r1 = compose(ok(1), ok(2), ok(3)); // ok([1, 2, 3])
// const r2 = compose(ok(1), err("error"), ok(3)); // err(["error"])
// const r3 = compose(ok(1), err("error1"), err("error2")); // err(["error1", "error2"])
// const r4 = compose(ok(1), err("error1"), err(2)); // err(["error1", 2])
