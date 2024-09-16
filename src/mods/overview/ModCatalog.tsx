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
    name: "Ticket Leaderboard",
    defaultLayout: createSimpleLayout(
      {
        x: 0,
        y: 0,
        w: 6,
        h: 11,
        minW: 3,
        maxW: 6,
        minH: 9,
        maxH: 20,
      },
      {
        xs: { w: 4, h: 11, x: 0, y: 0 },
        sm: { w: 6, h: 11, x: 0, y: 0 },
        md: { w: 4, h: 11, x: 0, y: 0 },
        lg: { w: 4, h: 11, x: 0, y: 0 },
        xl: { w: 6, h: 11, x: 0, y: 0 },
      }
    ),
    card: {
      title: "Tickets",
      variant: "outlined",
    },
    component: TicketLeaderboard,
  },
  volume: {
    name: "Ticket Status",
    defaultLayout: createSimpleLayout(
      {
        x: 6,
        y: 0,
        w: 5,
        h: 5,
        minW: 3,
        maxW: 5,
        minH: 4,
        maxH: 9,
      },
      {
        xs: { w: 4, h: 5, x: 0, y: 11 },
        sm: { w: 4, h: 5, x: 0, y: 11 },
        md: { w: 5, h: 5, x: 4, y: 0 },
        lg: { w: 5, h: 5, x: 4, y: 0 },
        xl: { w: 5, h: 5, x: 6, y: 0 },
      }
    ),
    card: { title: "Volume" },
    component: TicketStatusChart,
  },
  type: {
    name: "Ticket Type",
    defaultLayout: createSimpleLayout(
      {
        x: 11,
        y: 0,
        w: 5,
        h: 6,
        minW: 3,
        maxW: 5,
        minH: 4,
        maxH: 9,
      },
      {
        xs: { w: 4, h: 6, x: 0, y: 16 },
        sm: { w: 4, h: 6, x: 0, y: 16 },
        md: { w: 5, h: 6, x: 4, y: 5 },
        lg: { w: 5, h: 6, x: 4, y: 5 },
        xl: { w: 5, h: 6, x: 6, y: 5 },
      }
    ),
    card: { title: "Type" },
    component: TicketTypeChart,
  },
  activity: {
    name: "Ticket Activity",
    defaultLayout: createSimpleLayout(
      {
        x: 0,
        y: 11,
        w: 8,
        h: 5,
        minW: 4,
        minH: 3,
        maxH: 9,
      },
      {
        xs: { w: 4, h: 5, x: 0, y: 33 },
        sm: { w: 6, h: 5, x: 0, y: 22 },
        md: { w: 6, h: 5, x: 0, y: 11 },
        lg: { w: 7, h: 5, x: 0, y: 11 },
        xl: { w: 8, h: 5, x: 0, y: 11 },
      }
    ),
    card: { title: "Activity" },
    component: TicketActivityChart,
  },
  reporters: {
    name: "Ticket Reporters",
    defaultLayout: createSimpleLayout(
      {
        x: 8,
        y: 11,
        w: 4,
        h: 11,
        minW: 2,
        maxW: 4,
        minH: 7,
        maxH: 15,
      },
      {
        xs: { w: 4, h: 11, x: 0, y: 22 },
        sm: { w: 2, h: 11, x: 4, y: 11 },
        md: { w: 3, h: 10, x: 6, y: 11 },
        lg: { w: 3, h: 11, x: 9, y: 0 },
        xl: { w: 4, h: 11, x: 11, y: 0 },
      }
    ),
    card: { title: "Reporters", variant: "outlined" },
    component: TicketReporterBoard,
  },
  frontline: {
    name: "Ticket Opened",
    defaultLayout: createSimpleLayout(
      {
        x: 12,
        y: 11,
        w: 4,
        h: 5,
        minW: 4,
        minH: 3,
        maxH: 9,
      },
      {
        xs: { w: 4, h: 5, x: 0, y: 38 },
        sm: { w: 6, h: 5, x: 0, y: 27 },
        md: { w: 6, h: 5, x: 0, y: 16 },
        lg: { w: 5, h: 5, x: 7, y: 11 },
        xl: { w: 8, h: 5, x: 8, y: 11 },
      }
    ),
    card: { title: "Frontline" },
    component: TicketFrontlineChart,
  },
};
