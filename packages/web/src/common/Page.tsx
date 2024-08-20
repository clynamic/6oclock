import { Box } from "@mui/material";
import { PropsWithChildren } from "react";

export const Page: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        paddingLeft: {
          xs: 0.5,
          sm: 2,
        },
        paddingRight: {
          xs: 0.5,
          sm: 2,
        },
        backgroundColor: "background.default",
        backgroundImage: 'url("/assets/hex-tile.png")',
      }}
    >
      {children}
    </Box>
  );
};
