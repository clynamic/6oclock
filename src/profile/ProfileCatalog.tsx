import { ItemType } from '../api';
import { UserCard } from '../common/UserCard';
import { DashboardCatalog, createLayout } from '../dashboard/DashboardItem';
import { ApprovalCountSeriesByApproverChart } from '../janitors/charts/ApprovalCountSeriesByApproverChart';
import { UploadsSeriesByUploaderChart } from '../janitors/charts/UploadsSeriesByUploaderChart';
import { TicketClosedSeriesByHandlerChart } from '../mods/charts/TicketClosedSeriesByHandlerChart';
import { TicketCreatedSeriesByReporterChart } from '../mods/charts/TicketCreatedSeriesByReporterChart';
import { TicketTypeSummaryByHandlerTypeChart } from '../mods/charts/TicketTypeSummaryByHandlerTypeChart';
import { PerformanceCard } from '../performance/PerformanceCard';
import { ReplacementHandledSeriesChart } from './charts/ReplacementHandledSeriesChart';
import { UserActivitySeriesChart } from './charts/UserActivitySeriesChart';

export const profileCatalog: DashboardCatalog = {
  userHead: {
    name: 'User Head',
    layout: createLayout(
      {
        minW: 2,
        maxW: 9,
        minH: 2,
        maxH: 3,
      },
      {
        xs: { x: 0, y: 0, w: 4, h: 2 },
        sm: { x: 0, y: 0, w: 6, h: 2 },
        md: { x: 0, y: 0, w: 9, h: 2 },
        lg: { x: 0, y: 0, w: 6, h: 2 },
        xl: { x: 0, y: 0, w: 5, h: 2 },
      },
    ),
    component: UserCard,
  },
  userActivity: {
    name: 'User Activity',
    layout: createLayout(
      {
        minW: 2,
        maxW: 6,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 7, w: 4, h: 5 },
        sm: { x: 0, y: 7, w: 6, h: 5 },
        md: { x: 4, y: 2, w: 5, h: 5 },
        lg: { x: 0, y: 7, w: 6, h: 5 },
        xl: { x: 0, y: 7, w: 5, h: 5 },
      },
    ),
    card: { title: 'User Activity' },
    component: UserActivitySeriesChart,
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
        xs: { x: 0, y: 2, w: 4, h: 5 },
        sm: { x: 0, y: 2, w: 6, h: 5 },
        md: { x: 0, y: 2, w: 4, h: 5 },
        lg: { x: 0, y: 2, w: 6, h: 5 },
        xl: { x: 0, y: 2, w: 5, h: 5 },
      },
    ),
    card: { title: 'Performance' },
    component: PerformanceCard,
  },
  ticketsCreated: {
    name: 'Tickets Created',
    layout: createLayout(
      {
        minW: 2,
        maxW: 9,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 12, w: 4, h: 5 },
        sm: { x: 0, y: 12, w: 6, h: 5 },
        md: { x: 0, y: 7, w: 9, h: 5 },
        lg: { x: 6, y: 10, w: 6, h: 5 },
        xl: { x: 5, y: 5, w: 5, h: 5 },
      },
    ),
    items: [ItemType.tickets],
    card: { title: 'Tickets Created' },
    component: TicketCreatedSeriesByReporterChart,
  },
  ticketsHandled: {
    name: 'Tickets Handled',
    layout: createLayout(
      {
        minW: 2,
        maxW: 9,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 17, w: 4, h: 5 },
        sm: { x: 0, y: 17, w: 6, h: 5 },
        md: { x: 0, y: 17, w: 5, h: 5 },
        lg: { x: 6, y: 15, w: 6, h: 5 },
        xl: { x: 10, y: 5, w: 5, h: 5 },
      },
    ),
    card: { title: 'Tickets Handled' },
    component: TicketClosedSeriesByHandlerChart,
  },
  ticketTypes: {
    name: 'Ticket Types',
    layout: createLayout(
      {
        minW: 2,
        maxW: 9,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 22, w: 4, h: 5 },
        sm: { x: 0, y: 22, w: 6, h: 5 },
        md: { x: 5, y: 17, w: 4, h: 5 },
        lg: { x: 6, y: 20, w: 6, h: 5 },
        xl: { x: 5, y: 10, w: 5, h: 5 },
      },
    ),
    card: { title: 'Ticket Types' },
    component: TicketTypeSummaryByHandlerTypeChart,
  },
  postsUploaded: {
    name: 'Posts Uploaded',
    layout: createLayout(
      {
        minW: 2,
        maxW: 9,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 12, w: 4, h: 5 },
        sm: { x: 0, y: 12, w: 6, h: 5 },
        md: { x: 0, y: 7, w: 9, h: 5 },
        lg: { x: 6, y: 0, w: 6, h: 5 },
        xl: { x: 5, y: 0, w: 5, h: 5 },
      },
    ),
    items: [ItemType.post_versions],
    card: { title: 'Posts Uploaded' },
    component: UploadsSeriesByUploaderChart,
  },
  postsHandled: {
    name: 'Posts Handled',
    layout: createLayout(
      {
        minW: 2,
        maxW: 9,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 17, w: 4, h: 5 },
        sm: { x: 0, y: 17, w: 6, h: 5 },
        md: { x: 0, y: 12, w: 9, h: 5 },
        lg: { x: 6, y: 5, w: 6, h: 5 },
        xl: { x: 10, y: 0, w: 5, h: 5 },
      },
    ),
    card: { title: 'Posts Handled' },
    component: ApprovalCountSeriesByApproverChart,
  },
  replacementsHandled: {
    name: 'Replacements Handled',
    layout: createLayout(
      {
        minW: 2,
        maxW: 9,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 22, w: 4, h: 5 },
        sm: { x: 0, y: 22, w: 6, h: 5 },
        md: { x: 0, y: 17, w: 9, h: 5 },
        lg: { x: 0, y: 10, w: 6, h: 5 },
        xl: { x: 10, y: 5, w: 5, h: 5 },
      },
    ),
    card: { title: 'Replacements Handled' },
    component: ReplacementHandledSeriesChart,
  },
};
