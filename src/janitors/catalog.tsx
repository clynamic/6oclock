import { Approval, Upload } from "../api";
import { DashboardCatalog, DashboardLayouts } from "../dashboard";
import { ApprovalLeaderboard } from "./approvals";
import { ApprovalActivityChart } from "./charts";
import { UploaderBoard } from "./uploads/UploaderBoard";

export interface JanitorDashboardItemProps {
  approvals?: Approval[];
  uploads?: Upload[];
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
    { i: "approvals", x: 0, y: 0, w: 4, h: 11 },
    { i: "uploaders", x: 4, y: 0, w: 4, h: 11 },
    { i: "activity", x: 0, y: 11, w: 8, h: 4 },
  ],
};
