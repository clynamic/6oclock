import { Typography } from "@mui/material";
import { ReactNode } from "react";

export interface RankingTextProps {
  children: ReactNode;
  rank: number;
}

export const RankingText: React.FC<RankingTextProps> = ({ children, rank }) => {
  const gradients = [
    "linear-gradient(45deg, #ffd700, #ffec99, #ffd700)", // gold
    "linear-gradient(45deg, #c0c0c0, #e0e0e0, #c0c0c0)", // silver
    "linear-gradient(45deg, #cd7f32, #e6b98d, #cd7f32)", // bronze
  ];

  const getGradientStyle = (rank: number) => {
    if (rank < 4) {
      return {
        backgroundImage: gradients[rank - 1],
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      };
    } else {
      return {
        color: "text.secondary",
      };
    }
  };

  return (
    <Typography variant={rank < 4 ? "h6" : "body1"} sx={getGradientStyle(rank)}>
      {children}
    </Typography>
  );
};