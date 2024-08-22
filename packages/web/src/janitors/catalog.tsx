import { Approval, PostVersion } from "../api";
import { DashboardCatalog, DashboardLayouts } from "../dashboard";
import { ApprovalLeaderboard } from "./approvals";
import { ApprovalActivityChart } from "./charts";
import { UploaderBoard } from "./uploads";

export interface JanitorDashboardItemProps {
  approvals?: Approval[];
  postVersions?: PostVersion[];
}

export const janitorDashboardCatalog: DashboardCatalog<JanitorDashboardItemProps> =
  {
    approvals: {
      component: ApprovalLeaderboard,
      title: "Leaderboard",
      variant: "outlined",
    },
    uploaders: {
      component: UploaderBoard,
      title: "Uploaders",
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
      i: "uploaders",
      x: 4,
      y: 0,
      w: 4,
      h: 11,
      minW: 2,
      maxW: 4,
      minH: 7,
      maxH: 15,
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
