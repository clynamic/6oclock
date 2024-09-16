import { createSimpleLayout, DashboardCatalog } from "../../dashboard";
import { ApprovalLeaderboard } from "../approvals";
import { ApprovalActivityChart } from "../charts";

export const janitorDashboardCatalog: DashboardCatalog = {
  approvals: {
    name: "Approval Leaderboard",
    component: ApprovalLeaderboard,
    defaultLayout: createSimpleLayout(
      {
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
        xs: { x: 0, y: 0, w: 4, h: 11 },
        sm: { x: 0, y: 0, w: 4, h: 11 },
        md: { x: 0, y: 0, w: 4, h: 11 },
        lg: { w: 4, h: 11, x: 0, y: 0 },
        xl: { x: 0, y: 0, w: 6, h: 11 },
      }
    ),
    card: {
      title: "Approvals",
      variant: "outlined",
    },
  },
  activity: {
    name: "Approval Activity",
    component: ApprovalActivityChart,
    defaultLayout: createSimpleLayout(
      {
        x: 0,
        y: 11,
        w: 8,
        h: 4,
        minW: 4,
        minH: 3,
        maxH: 9,
      },
      {
        xs: { x: 0, y: 11, w: 8, h: 4 },
        sm: { x: 0, y: 11, w: 8, h: 4 },
        md: { x: 0, y: 11, w: 8, h: 4 },
        lg: { w: 8, h: 4, x: 4, y: 0 },
        xl: { x: 6, y: 0, w: 10, h: 5 },
      }
    ),
    card: { title: "Activity" },
  },
};
