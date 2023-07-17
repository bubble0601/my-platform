import "@total-typescript/ts-reset";

declare global {
  type PickPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  type PickRequired<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;
}
