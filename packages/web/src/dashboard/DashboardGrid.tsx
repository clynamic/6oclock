import { Ref } from 'react';

import { Box, useTheme } from '@mui/material';
import {
  LayoutItem,
  LegacyResponsiveReactGridLayoutProps,
  Responsive,
  ResponsiveLayouts,
  WidthProvider,
} from 'react-grid-layout/legacy';

import { useDashboard } from './DashboardContext';
import { HandleDirection, ResizableHandle } from './ResizableHandle';

export type DashboardLayout = LayoutItem;
export type DashboardLayouts = ResponsiveLayouts;

const ResponsiveGridLayout = WidthProvider(Responsive);

export type DashboardGridProps = Omit<
  LegacyResponsiveReactGridLayoutProps,
  'width'
>;

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
        // Transforms only while editing: a transformed ancestor traps the chart
        // tooltip's fixed positioning inside the card, letting neighbor cards
        // overlap it (MUI X Charts portals the tooltip into the chart container,
        // not the body). Charts are not hoverable while editing, so top/left
        // positioning when idle costs nothing and keeps transforms for dragging.
        useCSSTransforms={isEditing}
        breakpoints={breakpoints.values}
        cols={{ xl: 16, lg: 12, md: 9, sm: 6, xs: 4 }}
        rowHeight={50}
        {...rest}
      />
    </Box>
  );
};
