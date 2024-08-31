import { DashboardCatalog, DashboardLayouts } from "../dashboard";
import { ApprovalLeaderboard } from "./approvals";
import { ApprovalActivityChart } from "./charts";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JanitorDashboardItemProps {}

export const janitorDashboardCatalog: DashboardCatalog<JanitorDashboardItemProps> =
  {
    approvals: {
      component: ApprovalLeaderboard,
      title: "Leaderboard",
      variant: "outlined",
    },
    activity: {
      component: ApprovalActivityChart,
      title: "Activity",
    },
  };

export const defaultJanitorDashboardLayouts: DashboardLayouts = {
  lg: [
    {
      i: "approvals",
      x: 0,
      y: 0,
      w: 4,
      h: 11,
      minW: 3,
      maxW: 6,
      minH: 9,
      maxH: 20,
    },
    {
      i: "activity",
      x: 0,
      y: 11,
      w: 8,
      h: 4,
      minW: 4,
      maxW: undefined,
      minH: 3,
      maxH: 9,
    },
  ],
};
