import { createSimpleLayout, DashboardCatalog } from "../../dashboard";
import { TicketHandlerChart } from "../charts";

export const modProfileCatalog: DashboardCatalog = {
  ticketsClosed: {
    name: "Tickets Closed",
    defaultLayout: createSimpleLayout(
      {
        x: 0,
        y: 0,
        w: 5,
        h: 5,
        minW: 3,
        maxW: 5,
        minH: 4,
        maxH: 9,
      },
      {
        xs: { w: 4, h: 5, x: 0, y: 0 },
        sm: { w: 4, h: 5, x: 0, y: 0 },
        md: { w: 5, h: 5, x: 4, y: 0 },
        lg: { w: 5, h: 5, x: 4, y: 0 },
        xl: { w: 5, h: 5, x: 6, y: 0 },
      }
    ),
    card: { title: "Closed" },
    component: TicketHandlerChart,
  },
};
