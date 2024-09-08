import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const AppLogo = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="text"
      color="secondary"
      size="small"
      onClick={() => navigate("/")}
      sx={{
        textTransform: "none",
        color: "text.primary",
      }}
    >
      <Typography variant="h4" whiteSpace={"nowrap"}>
        6o
      </Typography>
    </Button>
  );
};
