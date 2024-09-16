import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  ReactNode,
} from "react";

type Props = {
  children?: ReactNode;
};

// from https://github.com/reaktivo/react-nest
export const Nest = (props: Props) => {
  return (
    <Fragment>
      {Children.toArray(props.children)
        .reverse()
        .reduce(
          (child, parent) => {
            return isValidElement(parent)
              ? cloneElement(parent, parent.props, child)
              : child;
          },
          <Fragment />
        )}
    </Fragment>
  );
};
