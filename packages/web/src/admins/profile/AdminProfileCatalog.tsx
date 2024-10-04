import { UserCard } from '../../common';
import { createSimpleLayout, DashboardCatalog } from '../../dashboard';
import { ApprovalCountSeriesByApproverChart } from '../../janitors';
import {
  TicketClosedSeriesByHandlerChart,
  TicketTypeSummaryByHandlerTypeChart,
} from '../../mods';
import { AdminActivitySummaryByAdminChart } from '../charts';

export const adminProfileCatalog: DashboardCatalog = {
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
        maxH: 2,
      },
      {
        xs: { w: 4, h: 2, x: 0, y: 0 },
        sm: { w: 6, h: 2, x: 0, y: 0 },
        md: { w: 4, h: 2, x: 0, y: 0 },
        lg: { w: 5, h: 2, x: 0, y: 0 },
        xl: { w: 4, h: 2, x: 0, y: 0 },
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
        xs: { w: 4, h: 5, x: 0, y: 2 },
        sm: { w: 3, h: 5, x: 0, y: 2 },
        md: { w: 4, h: 5, x: 0, y: 2 },
        lg: { w: 5, h: 5, x: 0, y: 2 },
        xl: { w: 6, h: 5, x: 10, y: 5 },
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
        maxW: undefined,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { w: 4, h: 5, x: 0, y: 7 },
        sm: { w: 6, h: 5, x: 0, y: 7 },
        md: { w: 5, h: 5, x: 4, y: 0 },
        lg: { w: 7, h: 5, x: 5, y: 0 },
        xl: { w: 6, h: 5, x: 4, y: 0 },
      },
    ),
    card: { title: 'Tickets Handled' },
    component: TicketClosedSeriesByHandlerChart,
  },
  postsHandled: {
    name: 'Posts Handled',
    defaultLayout: createSimpleLayout(
      {
        x: 10,
        y: 0,
        w: 5,
        h: 5,
        minW: 2,
        maxW: undefined,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { w: 4, h: 5, x: 0, y: 12 },
        sm: { w: 6, h: 5, x: 0, y: 12 },
        md: { w: 5, h: 5, x: 4, y: 5 },
        lg: { w: 7, h: 5, x: 5, y: 5 },
        xl: { w: 6, h: 5, x: 10, y: 0 },
      },
    ),
    card: { title: 'Posts Handled' },
    component: ApprovalCountSeriesByApproverChart,
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
        maxW: undefined,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { w: 4, h: 5, x: 0, y: 17 },
        sm: { w: 3, h: 5, x: 3, y: 2 },
        md: { w: 4, h: 5, x: 0, y: 7 },
        lg: { w: 5, h: 5, x: 0, y: 7 },
        xl: { w: 6, h: 5, x: 4, y: 5 },
      },
    ),
    card: { title: 'User Activity' },
    component: AdminActivitySummaryByAdminChart,
  },
};
