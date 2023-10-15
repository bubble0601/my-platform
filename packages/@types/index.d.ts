import "@total-typescript/ts-reset";

declare global {
  type Maybe<T> = T | null | undefined;
  type Xor<
    T extends Record<string | number | symbol, unknown>,
    U extends Record<string | number | symbol, unknown>,
  > =
    | (T & {
        [K in keyof U]?: never;
      })
    | (U & {
        [K in keyof T]?: never;
      });
  type PickPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  type PickRequired<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;
}
