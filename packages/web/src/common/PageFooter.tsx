import { Box, Typography } from "@mui/material";
// get app version
import { version } from "../../package.json";

export const PageFooter = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 1,
        backgroundColor: "background.paper",
        borderTopLeftRadius: (theme) => theme.shape.borderRadius,
        borderTopRightRadius: (theme) => theme.shape.borderRadius,
        marginTop: 1,
      }}
    >
      <Typography variant="body2">6 o'clock</Typography>
      <Typography variant="caption">{version}</Typography>
    </Box>
  );
};
