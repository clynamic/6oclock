import { Box } from '@mui/material';

export interface DashboardChildForwardProps {
  className?: string;
  style?: React.CSSProperties;
  onMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onTouchEnd?: (event: React.TouchEvent<HTMLDivElement>) => void;
  ref?: React.Ref<HTMLDivElement>;
}

export interface DashboardChildCreateProps {
  className?: string;
}

export const createDashboardChild = <P extends object>(
  Component: React.ComponentType<P>,
  props?: DashboardChildCreateProps,
) => {
  return function DashboardChildWrapper({
    className,
    style,
    onMouseDown,
    onMouseUp,
    onTouchEnd,
    ref,
    ...rest
  }: P & DashboardChildForwardProps) {
    return (
      <Box
        ref={ref}
        className={(className ?? '') + (props?.className ?? '')}
        style={style}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
      >
        <Component {...(rest as P)} />
      </Box>
    );
  };
};
