import { DashboardPositions } from "../../api";
import { DashboardCatalog } from "../../dashboard";
import {
  TicketActivityChart,
  TicketFrontlineChart,
  TicketStatusChart,
  TicketTypeChart,
} from "../charts";
import { TicketReporterBoard } from "../reports";
import { TicketLeaderboard } from "../tickets";

// TODO: remove this entirely? context provider for extra props?
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModDashboardItemProps {}

export const modDashboardCatalog: DashboardCatalog<ModDashboardItemProps> = {
  tickets: {
    component: TicketLeaderboard,
    constraints: {
      minW: 3,
      maxW: 6,
      minH: 9,
      maxH: 20,
    },
    card: {
      title: "Tickets",
      variant: "outlined",
    },
  },
  volume: {
    component: TicketStatusChart,
    constraints: {
      minW: 3,
      maxW: 5,
      minH: 4,
      maxH: 9,
    },
    card: { title: "Volume" },
  },
  type: {
    component: TicketTypeChart,
    constraints: {
      minW: 3,
      maxW: 5,
      minH: 4,
      maxH: 9,
    },
    card: { title: "Type" },
  },
  activity: {
    component: TicketActivityChart,
    constraints: {
      minW: 4,
      maxW: undefined,
      minH: 3,
      maxH: 9,
    },
    card: { title: "Activity" },
  },
  reporters: {
    component: TicketReporterBoard,
    constraints: {
      minW: 2,
      maxW: 4,
      minH: 7,
      maxH: 15,
    },
    card: { title: "Reporters", variant: "outlined" },
  },
  frontline: {
    component: TicketFrontlineChart,
    constraints: {
      minW: 4,
      maxW: undefined,
      minH: 3,
      maxH: 9,
    },
    card: { title: "Frontline" },
  },
};

export const defaultModDashboardPositions: DashboardPositions = {
  xl: [
    {
      i: "tickets",
      x: 0,
      y: 0,
      w: 6,
      h: 11,
    },
    {
      i: "volume",
      x: 6,
      y: 0,
      w: 5,
      h: 5,
    },
    {
      i: "type",
      x: 11,
      y: 0,
      w: 5,
      h: 6,
    },
    {
      i: "activity",
      x: 0,
      y: 11,
      w: 8,
      h: 5,
    },
    {
      i: "reporters",
      x: 8,
      y: 11,
      w: 4,
      h: 11,
    },
    {
      i: "frontline",
      x: 12,
      y: 11,
      w: 4,
      h: 5,
    },
  ],
  lg: [
    {
      i: "tickets",
      x: 0,
      y: 0,
      w: 4,
      h: 11,
    },
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
  md: [
    {
      i: "tickets",
      x: 0,
      y: 0,
      w: 6,
      h: 11,
    },
    {
      i: "volume",
      x: 6,
      y: 0,
      w: 3,
      h: 5,
    },
    {
      i: "type",
      x: 6,
      y: 5,
      w: 3,
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
      x: 9,
      y: 0,
      w: 3,
      h: 11,
    },
    {
      i: "frontline",
      x: 9,
      y: 11,
      w: 3,
      h: 5,
    },
  ],
  sm: [
    {
      i: "tickets",
      x: 0,
      y: 0,
      w: 6,
      h: 11,
    },
    {
      i: "volume",
      x: 0,
      y: 11,
      w: 3,
      h: 5,
    },
    {
      i: "type",
      x: 3,
      y: 11,
      w: 3,
      h: 6,
    },
    {
      i: "activity",
      x: 0,
      y: 16,
      w: 6,
      h: 5,
    },
    {
      i: "reporters",
      x: 0,
      y: 21,
      w: 6,
      h: 11,
    },
    {
      i: "frontline",
      x: 0,
      y: 32,
      w: 6,
      h: 5,
    },
  ],
  xs: [
    {
      i: "tickets",
      x: 0,
      y: 0,
      w: 4,
      h: 11,
    },
    {
      i: "volume",
      x: 0,
      y: 11,
      w: 4,
      h: 5,
    },
    {
      i: "type",
      x: 0,
      y: 16,
      w: 4,
      h: 6,
    },
    {
      i: "activity",
      x: 0,
      y: 22,
      w: 4,
      h: 5,
    },
    {
      i: "reporters",
      x: 0,
      y: 27,
      w: 4,
      h: 11,
    },
    {
      i: "frontline",
      x: 0,
      y: 38,
      w: 4,
      h: 5,
    },
  ],
};
