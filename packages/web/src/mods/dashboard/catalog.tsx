import { createSimpleLayout, DashboardCatalog } from "../../dashboard";
import {
  TicketActivityChart,
  TicketFrontlineChart,
  TicketStatusChart,
  TicketTypeChart,
} from "../charts";
import { TicketReporterBoard } from "../reports";
import { TicketLeaderboard } from "../tickets";

export const modDashboardCatalog: DashboardCatalog = {
  tickets: {
    defaultLayout: createSimpleLayout({
      x: 0,
      y: 0,
      w: 6,
      h: 11,
      minW: 3,
      maxW: 6,
      minH: 9,
      maxH: 20,
    }),
    card: {
      title: "Tickets",
      variant: "outlined",
    },
    component: TicketLeaderboard,
  },
  volume: {
    defaultLayout: createSimpleLayout({
      x: 6,
      y: 0,
      w: 5,
      h: 5,
      minW: 3,
      maxW: 5,
      minH: 4,
      maxH: 9,
    }),
    card: { title: "Volume" },
    component: TicketStatusChart,
  },
  type: {
    defaultLayout: createSimpleLayout({
      x: 11,
      y: 0,
      w: 5,
      h: 6,
      minW: 3,
      maxW: 5,
      minH: 4,
      maxH: 9,
    }),
    card: { title: "Type" },
    component: TicketTypeChart,
  },
  activity: {
    defaultLayout: createSimpleLayout({
      x: 0,
      y: 11,
      w: 8,
      h: 5,
      minW: 4,
      minH: 3,
      maxH: 9,
    }),
    card: { title: "Activity" },
    component: TicketActivityChart,
  },
  reporters: {
    defaultLayout: createSimpleLayout({
      x: 8,
      y: 11,
      w: 4,
      h: 11,
      minW: 2,
      maxW: 4,
      minH: 7,
      maxH: 15,
    }),
    card: { title: "Reporters", variant: "outlined" },
    component: TicketReporterBoard,
  },
  frontline: {
    defaultLayout: createSimpleLayout({
      x: 12,
      y: 11,
      w: 4,
      h: 5,
      minW: 4,
      minH: 3,
      maxH: 9,
    }),
    card: { title: "Frontline" },
    component: TicketFrontlineChart,
  },
};
