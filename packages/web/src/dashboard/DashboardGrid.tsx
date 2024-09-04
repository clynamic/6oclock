import { Box, useTheme } from "@mui/material";
import {
  Layout,
  Layouts,
  Responsive,
  ResponsiveProps,
  WidthProvider,
} from "react-grid-layout";

import { useDashboard } from "./DashboardContext";

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
        ".react-grid-item.react-grid-placeholder": {
          borderRadius: 1,
          backgroundColor: "secondary.light",
        },
      }}
    >
      <ResponsiveGridLayout
        draggableHandle=".react-draggable-handle"
        resizeHandles={isEditing ? ["se", "sw", "ne", "nw"] : []}
        // TODO: fix this
        // resizeHandle={(handle) => <ResizableHandle direction={handle} />}
        compactType={"horizontal"}
        breakpoints={breakpoints.values}
        cols={{ xl: 16, lg: 12, md: 9, sm: 6, xs: 4 }}
        rowHeight={50}
        {...rest}
      />
    </Box>
  );
};
