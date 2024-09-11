import { SearchOff } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";

export const NoDataHint: React.FC = () => {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ height: "100%" }}
    >
      <SearchOff sx={{ fontSize: 48 }} />
      <Typography variant="h6">No data</Typography>
    </Stack>
  );
};
