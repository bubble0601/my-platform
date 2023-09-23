export const hasKey = <T extends {}>(
  obj: T,
  key: Maybe<string | number | symbol>,
): key is keyof T => key != null && key in obj;
