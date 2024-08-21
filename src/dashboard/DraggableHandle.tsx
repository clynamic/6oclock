import { DragHandle } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { createDashboardChild } from "./DashboardChild";

export const DraggableHandle = createDashboardChild(
  () => {
    return (
      <IconButton sx={{ cursor: "grab" }} size="small" color="secondary">
        <DragHandle />
      </IconButton>
    );
  },
  {
    className: "react-draggable-handle",
  }
);
