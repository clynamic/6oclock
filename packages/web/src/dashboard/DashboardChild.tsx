import { Box } from "@mui/material";
import { forwardRef } from "react";

export interface DashboardChildForwardProps {
  className?: string;
  style?: React.CSSProperties;
  onMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onTouchEnd?: (event: React.TouchEvent<HTMLDivElement>) => void;
}

export interface DashboardChildProps {
  className?: string;
}

export const createDashboardChild = <P extends object>(
  Component: React.ComponentType<P>,
  props?: DashboardChildProps,
) => {
  return forwardRef<HTMLDivElement, P & DashboardChildForwardProps>(
    (
      { className, style, onMouseDown, onMouseUp, onTouchEnd, ...rest },
      ref,
    ) => {
      return (
        <Box
          ref={ref}
          className={(className ?? "") + (props?.className ?? "")}
          style={style}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onTouchEnd={onTouchEnd}
        >
          <Component {...(rest as P)} />
        </Box>
      );
    },
  );
};
