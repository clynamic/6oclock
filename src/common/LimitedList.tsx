import { Box } from "@mui/material";
import { TruncatedList, TruncatedListProps } from "react-truncate-list";

export interface LimitedListProps {
  indicator: TruncatedListProps["renderTruncator"];
  children: React.ReactNode;
}

export const LimitedList: React.FC<LimitedListProps> = ({
  children,
  indicator,
}) => {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        listStyleType: "none",
        paddingInline: 0,
        marginBlock: 0,
      }}
      renderTruncator={indicator}
      component={TruncatedList}
    >
      {children}
    </Box>
  );
};
