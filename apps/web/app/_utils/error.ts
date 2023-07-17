export const getErrorMessage = (e: unknown): string => {
  if (e == null) return "";
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;
  if (e instanceof Array && e.length > 0) {
    const combinedMessage = e
      .map((_e, i) => `${i + 1}: ${getErrorMessage(_e)}`)
      .join("\n");
    return `${e.length} errors\n${combinedMessage}`;
  }
  if (typeof e === "object") {
    if ("message" in e && typeof e.message === "string") {
      return e.message;
    }
    if ("msg" in e && typeof e.msg === "string") {
      return e.msg;
    }
  }
  return `Error: ${JSON.stringify(e)}`;
};

export const handleError = (e: unknown) => {
  console.error(e);
  alert(getErrorMessage(e));
};
