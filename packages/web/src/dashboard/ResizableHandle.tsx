import { ArrowBackIos } from '@mui/icons-material';
import { Box } from '@mui/material';
import { forwardRef } from 'react';
import { ReactGridLayoutProps } from 'react-grid-layout';

import { DashboardChildForwardProps } from './DashboardChild';

type ExtractResizeHandles<T> = T extends {
  resizeHandles?: (infer U)[] | undefined;
}
  ? U
  : never;

export type HandleDirection = ExtractResizeHandles<ReactGridLayoutProps>;

interface directionalStyle {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export const ResizableHandle = forwardRef<
  HTMLDivElement,
  { resizeHandle: HandleDirection } & DashboardChildForwardProps
>(({ resizeHandle, style, onMouseDown, onMouseUp, onTouchEnd }, ref) => {
  const directionStyle: directionalStyle = {};

  const offset = 4;

  if (resizeHandle === 'se') {
    directionStyle.bottom = offset;
    directionStyle.right = offset;
  } else if (resizeHandle === 'sw') {
    directionStyle.bottom = offset;
    directionStyle.left = offset;
  } else if (resizeHandle === 'ne') {
    directionStyle.top = offset;
    directionStyle.right = offset;
  } else if (resizeHandle === 'nw') {
    directionStyle.top = offset;
    directionStyle.left = offset;
  }

  const arrowRotation = {
    transform: `rotate(${
      directionStyle.top !== undefined
        ? directionStyle.left !== undefined
          ? '45deg'
          : '-225deg'
        : directionStyle.left !== undefined
          ? '315deg'
          : '-135deg'
    })`,
  };

  return (
    <Box
      ref={ref}
      className="react-resizable-handle"
      style={style}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
      sx={{
        position: 'absolute',
        ...directionStyle,
        cursor: `${resizeHandle}-resize`,
        backgroundImage: 'none',
      }}
    >
      <ArrowBackIos
        fontSize="small"
        sx={{
          ...arrowRotation,
        }}
      />
    </Box>
  );
});
