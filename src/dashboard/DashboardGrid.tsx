import { Ref } from 'react';

import { Box, useTheme } from '@mui/material';
import {
  Layout,
  Layouts,
  Responsive,
  ResponsiveProps,
  WidthProvider,
} from 'react-grid-layout';

import { useDashboard } from './DashboardContext';
import { HandleDirection, ResizableHandle } from './ResizableHandle';

export type DashboardLayout = Layout;
export type DashboardLayouts = Layouts;

const ResponsiveGridLayout = WidthProvider(Responsive);

export type DashboardGridProps = ResponsiveProps;

export const DashboardGrid: React.FC<DashboardGridProps> = ({ ...rest }) => {
  const { breakpoints } = useTheme();
  const { isEditing } = useDashboard();

  return (
    <Box
      sx={{
        '.react-grid-item.react-grid-placeholder': {
          borderRadius: 1,
          backgroundColor: 'secondary.light',
        },
        height: '100%',
        width: '100%',
      }}
    >
      <ResponsiveGridLayout
        style={{ width: '100%' }}
        draggableHandle=".react-draggable-handle"
        draggableCancel=".react-draggable-cancel"
        resizeHandles={isEditing ? ['se', 'sw', 'ne', 'nw'] : []}
        resizeHandle={
          ((handle: HandleDirection, ref: Ref<HTMLDivElement>) => (
            <ResizableHandle resizeHandle={handle} ref={ref} />
            // for some reason, the @types/react-grid-layout package does not recognize the ref prop
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          )) as any
        }
        compactType={'horizontal'}
        breakpoints={breakpoints.values}
        cols={{ xl: 16, lg: 12, md: 9, sm: 6, xs: 4 }}
        rowHeight={50}
        {...rest}
      />
    </Box>
  );
};
