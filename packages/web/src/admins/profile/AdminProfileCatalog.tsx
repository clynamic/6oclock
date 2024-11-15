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
        xs: { x: 0, y: 0, w: 4, h: 2 },
        sm: { x: 0, y: 0, w: 6, h: 2 },
        md: { x: 0, y: 0, w: 4, h: 2 },
        lg: { x: 0, y: 0, w: 4, h: 2 },
        xl: { x: 0, y: 0, w: 6, h: 2 },
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
        md: { x: 4, y: 5, w: 5, h: 5 },
        lg: { x: 4, y: 5, w: 4, h: 5 },
        xl: { x: 6, y: 5, w: 5, h: 5 },
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
        xs: { x: 0, y: 7, w: 4, h: 5 },
        sm: { x: 0, y: 7, w: 6, h: 5 },
        md: { x: 4, y: 0, w: 5, h: 5 },
        lg: { x: 4, y: 0, w: 4, h: 5 },
        xl: { x: 6, y: 0, w: 5, h: 5 },
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
        xs: { x: 0, y: 17, w: 4, h: 5 },
        sm: { x: 0, y: 17, w: 6, h: 5 },
        md: { x: 4, y: 10, w: 5, h: 5 },
        lg: { x: 8, y: 0, w: 4, h: 5 },
        xl: { x: 11, y: 0, w: 5, h: 5 },
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
        xs: { x: 0, y: 2, w: 4, h: 5 },
        sm: { x: 0, y: 2, w: 6, h: 5 },
        md: { x: 0, y: 2, w: 4, h: 5 },
        lg: { x: 0, y: 2, w: 4, h: 5 },
        xl: { x: 0, y: 2, w: 6, h: 5 },
      },
    ),
    card: { title: 'User Activity' },
    component: AdminActivitySummaryByAdminChart,
  },
};
