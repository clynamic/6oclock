import { UserCard } from '../../common/UserCard';
import { DashboardCatalog, createLayout } from '../../dashboard/DashboardItem';
import { ApprovalCountSeriesByApproverChart } from '../../janitors/charts/ApprovalCountSeriesByApproverChart';
import { TicketClosedSeriesByHandlerChart } from '../../mods/charts/TicketClosedSeriesByHandlerChart';
import { TicketTypeSummaryByHandlerTypeChart } from '../../mods/charts/TicketTypeSummaryByHandlerTypeChart';
import { PerformanceCard } from '../../performance/PerformanceCard';
import { UserActivitySeriesChart } from '../../users/charts/UserActivitySeriesChart';

export const adminProfileCatalog: DashboardCatalog = {
  userHead: {
    name: 'User Head',
    layout: createLayout(
      {
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
    layout: createLayout(
      {
        minW: 2,
        maxW: 6,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 12, w: 4, h: 5 },
        sm: { x: 0, y: 16, w: 6, h: 5 },
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
    layout: createLayout(
      {
        minW: 2,
        maxW: undefined,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 7, w: 4, h: 5 },
        sm: { x: 0, y: 11, w: 6, h: 5 },
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
    layout: createLayout(
      {
        minW: 2,
        maxW: undefined,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 17, w: 4, h: 5 },
        sm: { x: 0, y: 21, w: 6, h: 5 },
        md: { x: 4, y: 10, w: 5, h: 5 },
        lg: { x: 8, y: 0, w: 4, h: 5 },
        xl: { x: 11, y: 0, w: 5, h: 5 },
      },
    ),
    card: { title: 'Posts Handled' },
    component: ApprovalCountSeriesByApproverChart,
  },
  userPerformance: {
    name: 'User Performance',
    layout: createLayout(
      {
        minW: 2,
        maxW: 6,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 2, w: 4, h: 4 },
        sm: { x: 0, y: 2, w: 6, h: 4 },
        md: { x: 0, y: 2, w: 4, h: 4 },
        lg: { x: 0, y: 2, w: 4, h: 4 },
        xl: { x: 0, y: 2, w: 6, h: 4 },
      },
    ),
    card: { title: 'Performance' },
    component: PerformanceCard,
  },
  userActivity: {
    name: 'User Activity',
    layout: createLayout(
      {
        minW: 2,
        maxW: undefined,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 6, w: 4, h: 5 },
        sm: { x: 0, y: 6, w: 6, h: 5 },
        md: { x: 0, y: 6, w: 4, h: 5 },
        lg: { x: 0, y: 6, w: 4, h: 5 },
        xl: { x: 0, y: 6, w: 6, h: 5 },
      },
    ),
    card: { title: 'User Activity' },
    component: UserActivitySeriesChart,
  },
};
