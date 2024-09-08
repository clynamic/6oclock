import { Divider } from "@mui/material";

import { usePageHeaderContext } from "./PageHeaderContext";

export const NavDivider: React.FC = () => {
  const { layout } = usePageHeaderContext();

  if (layout === "small") {
    return <Divider orientation="horizontal" variant="middle" />;
  }
  if (layout === "wide") {
    return <Divider orientation="vertical" variant="middle" flexItem />;
  }
  return null;
};
