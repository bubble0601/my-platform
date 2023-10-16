import type { SyntheticEvent } from "react";

function composeEventHandlers<E extends SyntheticEvent | Event>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {},
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (!checkForDefaultPrevented || !event.defaultPrevented) {
      ourEventHandler?.(event);
    }
  };
}

export { composeEventHandlers };
