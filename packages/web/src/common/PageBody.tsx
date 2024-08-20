import { Box } from "@mui/material";

export const PageBody = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 1,
        backgroundColor: "background.paper",
        backgroundImage: 'url("/assets/hex-texture.png")',
        backgroundRepeat: "repeat-x",
        backgroundPosition: "top left",
      }}
    >
      {children}
    </Box>
  );
};
