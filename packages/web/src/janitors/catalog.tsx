import { Approval } from "../api";
import { DashboardCatalog } from "../dashboard";
import { ApprovalLeaderboard } from "./leaderboard";

export interface JanitorDashboardItemProps {
  approvals?: Approval[];
}

export const janitorDashboardCatalog: DashboardCatalog<JanitorDashboardItemProps> =
  {
    leaderboard: {
      component: ApprovalLeaderboard,
      title: "Leaderboard",
      variant: "outlined",
    },
  };

export const defaultJanitorDashboardLayouts = {
  lg: [{ i: "leaderboard", x: 0, y: 0, w: 4, h: 11 }],
};
