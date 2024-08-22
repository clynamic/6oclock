import { Ticket } from "../api";
import { DashboardCatalog, DashboardLayouts } from "../dashboard";
import {
  TicketActivityChart,
  TicketFrontlineChart,
  TicketStatusChart,
  TicketTypeChart,
} from "./charts";
import { TicketReporterBoard } from "./reports";
import { TicketLeaderboard } from "./tickets";

export interface ModDashboardItemProps {
  tickets?: Ticket[];
}

export const modDashboardCatalog: DashboardCatalog<ModDashboardItemProps> = {
  tickets: {
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
    {
      i: "tickets",
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
      i: "volume",
      x: 4,
      y: 0,
      w: 4,
      h: 5,
      minW: 3,
      maxW: 5,
      minH: 4,
      maxH: 9,
    },
    {
      i: "type",
      x: 4,
      y: 5,
      w: 4,
      h: 6,
      minW: 3,
      maxW: 5,
      minH: 4,
      maxH: 9,
    },
    {
      i: "activity",
      x: 0,
      y: 11,
      w: 6,
      h: 5,
      minW: 4,
      maxW: undefined,
      minH: 3,
      maxH: 9,
    },
    {
      i: "reporters",
      x: 8,
      y: 0,
      w: 4,
      h: 11,
      minW: 2,
      maxW: 4,
      minH: 7,
      maxH: 15,
    },
    {
      i: "frontline",
      x: 8,
      y: 11,
      w: 6,
      h: 5,
      minW: 4,
      maxW: undefined,
      minH: 3,
      maxH: 9,
    },
  ],
};
