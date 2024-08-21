import { useTheme } from "@mui/material";
import { Responsive, ResponsiveProps, WidthProvider } from "react-grid-layout";
import { ResizableHandle } from "./ResizableHandle";

const ResponsiveGridLayout = WidthProvider(Responsive);

export type DashboardGridProps = ResponsiveProps;

export const DashboardGrid: React.FC<DashboardGridProps> = ({ ...rest }) => {
  const { breakpoints } = useTheme();

  return (
    <ResponsiveGridLayout
      draggableHandle=".react-draggable-handle"
      // resizeHandle={(handle) => <ResizableHandle direction={handle} />}
      compactType={"horizontal"}
      breakpoints={breakpoints.values}
      cols={{ xl: 16, lg: 12, md: 9, sm: 6, xs: 4 }}
      rowHeight={50}
      {...rest}
    />
  );
};
