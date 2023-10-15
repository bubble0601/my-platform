// https://github.com/radix-ui/primitives/blob/28bebf2c6992d056244845c898abeff45dec2871/packages/react/compose-refs/src/composeRefs.tsx

import type { MutableRefObject, Ref } from "react";
import { useCallback } from "react";

type PossibleRef<T> = Ref<T> | undefined;

/**
 * Set a given ref to a given value
 * This utility takes care of different types of refs: callback refs and RefObject(s)
 */
function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    // eslint-disable-next-line no-param-reassign
    (ref as MutableRefObject<T>).current = value;
  }
}

/**
 * A utility to compose multiple refs together
 * Accepts callback refs and RefObject(s)
 */
function composeRefs<T>(...refs: Array<PossibleRef<T>>) {
  return (node: T) => {
    for (const ref of refs) setRef(ref, node);
  };
}

/**
 * A custom hook that composes multiple refs
 * Accepts callback refs and RefObject(s)
 */
function useComposedRefs<T>(...refs: Array<PossibleRef<T>>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(composeRefs(...refs), refs);
}

export { composeRefs, useComposedRefs };
