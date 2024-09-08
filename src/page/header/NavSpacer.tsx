import { Box } from "@mui/material";

import { usePageHeaderContext } from "./PageHeaderContext";

export const NavSpacer: React.FC = () => {
  const { layout } = usePageHeaderContext();

  if (layout === "small") {
    return null;
  }
  if (layout === "wide") {
    return <Box sx={{ flexGrow: 1 }} />;
  }
};
