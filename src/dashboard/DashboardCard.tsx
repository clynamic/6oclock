import { Box, Card, CardProps, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

import { createDashboardChild } from "./DashboardChild";
import { useDashboard } from "./DashboardContext";
import { DraggableHandle } from "./DraggableHandle";

export type DashboardCardProps = Pick<CardProps, "variant"> & {
  children: ReactNode;
  title?: ReactNode;
};

export const DashboardCard = createDashboardChild<DashboardCardProps>(
  ({ children, title, variant }) => {
    const { isEditing } = useDashboard();

    return (
      <Box sx={{ height: "100%" }}>
        <Card
          variant={variant}
          sx={{
            height: "100%",
            backgroundColor: variant === "outlined" ? "transparent" : undefined,
          }}
        >
          <Stack p={2} sx={{ height: "100%" }} spacing={1}>
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Typography variant="h6">{title}</Typography>
              {isEditing && <DraggableHandle />}
            </Stack>
            {children}
          </Stack>
        </Card>
      </Box>
    );
  }
);
