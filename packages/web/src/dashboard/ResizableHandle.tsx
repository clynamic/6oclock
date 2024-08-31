import { ArrowDropUp } from "@mui/icons-material";
import { Box } from "@mui/material";
import { ReactGridLayoutProps } from "react-grid-layout";

import { createDashboardChild } from "./DashboardChild";

type ExtractResizeHandles<T> = T extends {
  resizeHandles?: (infer U)[] | undefined;
}
  ? U
  : never;

export type HandleDirection = ExtractResizeHandles<ReactGridLayoutProps>;

export type ResizableHandleProps = {
  direction: HandleDirection;
};

export const ResizableHandle = createDashboardChild<ResizableHandleProps>(
  ({ direction }) => {
    return (
      <Box>
        <ArrowDropUp />
        {direction}
      </Box>
    );
  },
  {
    className: "react-resizable-handle",
  },
);
