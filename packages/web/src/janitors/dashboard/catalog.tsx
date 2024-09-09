import { createSimpleLayout, DashboardCatalog } from "../../dashboard";
import { ApprovalLeaderboard } from "../approvals";
import { ApprovalActivityChart } from "../charts";

export const janitorDashboardCatalog: DashboardCatalog = {
  approvals: {
    component: ApprovalLeaderboard,
    defaultLayout: createSimpleLayout({
      x: 0,
      y: 0,
      w: 4,
      h: 11,
      minW: 3,
      maxW: 6,
      minH: 9,
      maxH: 20,
    }),
    card: {
      title: "Approvals",
      variant: "outlined",
    },
  },
  activity: {
    component: ApprovalActivityChart,
    defaultLayout: createSimpleLayout({
      x: 0,
      y: 11,
      w: 8,
      h: 4,
      minW: 4,
      minH: 3,
      maxH: 9,
    }),
    card: { title: "Activity" },
  },
};
