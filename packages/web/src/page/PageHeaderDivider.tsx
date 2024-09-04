import { Divider } from "@mui/material";

import { SubNavigationEntry } from "./PageHeader";

export const PageHeaderDivider: SubNavigationEntry = {
  label: (
    <Divider
      key="divider"
      orientation="vertical"
      variant="middle"
      flexItem
      sx={{
        m: 1,
      }}
    />
  ),
};
