import { UserCard } from "../../common";
import { createSimpleLayout, DashboardCatalog } from "../../dashboard";
import { TicketHandlerChart } from "../charts";

export const modProfileCatalog: DashboardCatalog = {
  userHead: {
    name: "User Head",
    defaultLayout: createSimpleLayout(
      {
        x: 0,
        y: 0,
        w: 5,
        h: 2,
        minW: 2,
        maxW: 5,
        minH: 2,
        maxH: 3,
      },
      {
        xs: { w: 4, h: 2, x: 0, y: 0 },
        sm: { w: 4, h: 2, x: 0, y: 0 },
        md: { w: 5, h: 2, x: 0, y: 0 },
        lg: { w: 5, h: 2, x: 0, y: 0 },
        xl: { w: 5, h: 2, x: 0, y: 0 },
      }
    ),
    card: { variant: "outlined" },
    component: UserCard,
  },
  ticketsClosed: {
    name: "Tickets Closed",
    defaultLayout: createSimpleLayout(
      {
        x: 0,
        y: 2,
        w: 5,
        h: 5,
        minW: 2,
        maxW: 5,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { w: 4, h: 5, x: 0, y: 2 },
        sm: { w: 4, h: 5, x: 0, y: 2 },
        md: { w: 5, h: 5, x: 0, y: 2 },
        lg: { w: 5, h: 5, x: 0, y: 2 },
        xl: { w: 5, h: 5, x: 0, y: 2 },
      }
    ),
    card: { title: "Closed" },
    component: TicketHandlerChart,
  },
};
