import { UserCard } from '../../common';
import { createSimpleLayout, DashboardCatalog } from '../../dashboard';
import {
  TicketActivitySummaryByHandlerChart,
  TicketClosedSeriesByHandlerChart,
  TicketTypeSummaryByHandlerTypeChart,
} from '../charts';

export const modProfileCatalog: DashboardCatalog = {
  userHead: {
    name: 'User Head',
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
      },
    ),
    component: UserCard,
  },
  ticketTypes: {
    name: 'Ticket Types',
    defaultLayout: createSimpleLayout(
      {
        x: 5,
        y: 0,
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
        lg: { w: 5, h: 5, x: 5, y: 0 },
        xl: { w: 5, h: 5, x: 5, y: 0 },
      },
    ),
    card: { title: 'Ticket Types' },
    component: TicketTypeSummaryByHandlerTypeChart,
  },
  ticketsHandled: {
    name: 'Tickets Handled',
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
        xs: { w: 4, h: 5, x: 0, y: 5 },
        sm: { w: 4, h: 5, x: 0, y: 5 },
        md: { w: 5, h: 5, x: 0, y: 5 },
        lg: { w: 5, h: 5, x: 0, y: 5 },
        xl: { w: 5, h: 5, x: 0, y: 5 },
      },
    ),
    card: { title: 'Tickets Handled' },
    component: TicketClosedSeriesByHandlerChart,
  },
  userActivity: {
    name: 'User Activity',
    defaultLayout: createSimpleLayout(
      {
        x: 0,
        y: 7,
        w: 5,
        h: 5,
        minW: 2,
        maxW: 5,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { w: 4, h: 5, x: 0, y: 10 },
        sm: { w: 4, h: 5, x: 0, y: 10 },
        md: { w: 5, h: 5, x: 0, y: 10 },
        lg: { w: 5, h: 5, x: 0, y: 10 },
        xl: { w: 5, h: 5, x: 0, y: 10 },
      },
    ),
    card: { title: 'User Activity' },
    component: TicketActivitySummaryByHandlerChart,
  },
};
