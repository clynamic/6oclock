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
        maxW: undefined,
        minH: 2,
        maxH: 3,
      },
      {
        xs: { x: 0, y: 0, w: 4, h: 2 },
        sm: { x: 0, y: 0, w: 6, h: 2 },
        md: { x: 2, y: 0, w: 5, h: 2 },
        lg: { x: 0, y: 0, w: 5, h: 2 },
        xl: { x: 0, y: 0, w: 5, h: 2 },
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
        maxW: 6,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 12, w: 4, h: 5 },
        sm: { x: 0, y: 12, w: 6, h: 5 },
        md: { x: 2, y: 12, w: 5, h: 5 },
        lg: { x: 5, y: 5, w: 5, h: 5 },
        xl: { x: 5, y: 5, w: 5, h: 5 },
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
        maxW: 6,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 7, w: 4, h: 5 },
        sm: { x: 0, y: 7, w: 6, h: 5 },
        md: { x: 2, y: 7, w: 5, h: 5 },
        lg: { x: 5, y: 0, w: 5, h: 5 },
        xl: { x: 5, y: 0, w: 5, h: 5 },
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
        maxW: 6,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 2, w: 4, h: 5 },
        sm: { x: 0, y: 2, w: 6, h: 5 },
        md: { x: 2, y: 2, w: 5, h: 5 },
        lg: { x: 0, y: 2, w: 5, h: 5 },
        xl: { x: 0, y: 2, w: 5, h: 5 },
      },
    ),
    card: { title: 'User Activity' },
    component: TicketActivitySummaryByHandlerChart,
  },
};
