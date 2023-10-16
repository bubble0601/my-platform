import type { ElementRef, ForwardRefExoticComponent } from "react";
import { forwardRef } from "react";

export const wrap = <P extends { className?: string }>(
  Component: ForwardRefExoticComponent<P>,
) => {
  return <AP extends Record<string, unknown> = {}>(
    modifyProps: (props: P & AP) => P,
  ) => {
    const wrapped = forwardRef<
      ElementRef<ForwardRefExoticComponent<P>>,
      P & AP
    >((props, ref) => {
      const modifiedProps = {
        ...modifyProps(props),
        ref,
      };
      return <Component {...modifiedProps} />;
    });
    wrapped.displayName = Component.displayName;
    return wrapped;
  };
};
