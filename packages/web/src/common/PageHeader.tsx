import { Box } from "@mui/material";

export const PageHeader: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 1,
        backgroundColor: "background.paper",
        borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
        borderBottomRightRadius: (theme) => theme.shape.borderRadius,
        marginBottom: 1,
      }}
    >
      Header
    </Box>
  );
};
