import { Ticket } from "../api";
import { DashboardCatalog, DashboardLayouts } from "../dashboard";
import {
  TicketStatusChart,
  TicketTypeChart,
  TicketActivityChart,
  TicketFrontlineChart,
} from "./charts";
import { TicketLeaderboard } from "./contributions";
import { TicketReporterBoard } from "./reports";

export interface ModDashboardItemProps {
  tickets?: Ticket[];
}

export const modDashboardCatalog: DashboardCatalog<ModDashboardItemProps> = {
  leaderboard: {
    component: TicketLeaderboard,
    title: "Leaderboard",
    variant: "outlined",
  },
  volume: {
    component: TicketStatusChart,
    title: "Volume",
  },
  type: {
    component: TicketTypeChart,
    title: "Type",
  },
  activity: {
    component: TicketActivityChart,
    title: "Activity",
  },
  reporters: {
    component: TicketReporterBoard,
    title: "Reporters",
    variant: "outlined",
  },
  frontline: {
    component: TicketFrontlineChart,
    title: "Frontline",
  },
};

export const defaultModDashboardLayouts: DashboardLayouts = {
  lg: [
    { i: "leaderboard", x: 0, y: 0, w: 4, h: 11 },
    {
      i: "volume",
      x: 4,
      y: 0,
      w: 4,
      h: 5,
    },
    {
      i: "type",
      x: 4,
      y: 5,
      w: 4,
      h: 6,
    },
    {
      i: "activity",
      x: 0,
      y: 11,
      w: 6,
      h: 5,
    },
    {
      i: "reporters",
      x: 8,
      y: 0,
      w: 4,
      h: 11,
    },
    {
      i: "frontline",
      x: 8,
      y: 11,
      w: 6,
      h: 5,
    },
  ],
};
