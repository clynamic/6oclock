import { ItemType } from '../../api';
import { DashboardCatalog, createLayout } from '../../dashboard/DashboardItem';
import { PerformanceLeaderboard } from '../../performance/PerformanceBoard';
import { TicketOpenSeriesChart } from '../charts/TicketOpenSeriesChart';
import { TicketStatusSeriesChart } from '../charts/TicketStatusSeriesChart';
import { TicketStatusSummaryChart } from '../charts/TicketStatusSummaryChart';
import { TicketTypeSummaryChart } from '../charts/TicketTypeSummaryChart';
import { TicketReporterBoard } from '../reports/TicketReporterBoard';

export const modDashoardCatalogVersion = 2;

export const modDashboardCatalog: DashboardCatalog = {
  performanceLeaderboard: {
    name: 'Performance Leaderboard',
    layout: createLayout(
      {
        minW: 3,
        maxW: 6,
        minH: 9,
        maxH: 20,
      },
      {
        xs: { x: 0, y: 0, w: 4, h: 11 },
        sm: { x: 0, y: 0, w: 6, h: 11 },
        md: { x: 0, y: 0, w: 4, h: 11 },
        lg: { x: 0, y: 0, w: 4, h: 11 },
        xl: { x: 0, y: 0, w: 5, h: 16 },
      },
    ),
    card: {
      title: 'Performance',
      variant: 'outlined',
    },
    component: PerformanceLeaderboard,
  },
  ticketStatus: {
    name: 'All Tickets Status',
    layout: createLayout(
      {
        minW: 3,
        maxW: 8,
        minH: 4,
        maxH: 9,
      },
      {
        xs: { x: 0, y: 11, w: 4, h: 5 },
        sm: { x: 0, y: 11, w: 4, h: 5 },
        md: { x: 4, y: 0, w: 5, h: 5 },
        lg: { x: 4, y: 0, w: 5, h: 5 },
        xl: { x: 12, y: 0, w: 4, h: 5 },
      },
    ),
    items: [ItemType.tickets],
    card: { title: 'Status' },
    component: TicketStatusSummaryChart,
  },
  ticketType: {
    name: 'All Tickets Type',
    layout: createLayout(
      {
        minW: 3,
        maxW: 8,
        minH: 4,
        maxH: 9,
      },
      {
        xs: { x: 0, y: 16, w: 4, h: 6 },
        sm: { x: 0, y: 16, w: 4, h: 6 },
        md: { x: 4, y: 5, w: 5, h: 6 },
        lg: { x: 4, y: 5, w: 5, h: 6 },
        xl: { x: 5, y: 11, w: 7, h: 5 },
      },
    ),
    items: [ItemType.tickets],
    card: { title: 'Type' },
    component: TicketTypeSummaryChart,
  },
  ticketTurnaround: {
    name: 'Tickets Opened/Closed by Day',
    layout: createLayout(
      {
        minW: 4,
        minH: 3,
        maxH: 9,
      },
      {
        xs: { x: 0, y: 33, w: 4, h: 5 },
        sm: { x: 0, y: 22, w: 6, h: 5 },
        md: { x: 0, y: 11, w: 6, h: 5 },
        lg: { x: 0, y: 11, w: 7, h: 5 },
        xl: { x: 5, y: 0, w: 7, h: 5 },
      },
    ),
    items: [ItemType.tickets],
    card: { title: 'Turnaround' },
    component: TicketStatusSeriesChart,
  },
  ticketReporters: {
    name: 'Top Ticket Reporters',
    layout: createLayout(
      {
        minW: 2,
        maxW: 4,
        minH: 7,
        maxH: 15,
      },
      {
        xs: { x: 0, y: 22, w: 4, h: 11 },
        sm: { x: 4, y: 11, w: 2, h: 11 },
        md: { x: 6, y: 11, w: 3, h: 10 },
        lg: { x: 9, y: 0, w: 3, h: 11 },
        xl: { x: 12, y: 5, w: 4, h: 11 },
      },
    ),
    items: [ItemType.tickets],
    card: { title: 'Reporters', variant: 'outlined' },
    component: TicketReporterBoard,
  },
  ticketsOpened: {
    name: 'Tickets Open by Day',
    layout: createLayout(
      {
        minW: 4,
        minH: 3,
        maxH: 9,
      },
      {
        xs: { x: 0, y: 38, w: 4, h: 5 },
        sm: { x: 0, y: 27, w: 6, h: 5 },
        md: { x: 0, y: 16, w: 6, h: 5 },
        lg: { x: 7, y: 11, w: 5, h: 5 },
        xl: { x: 5, y: 5, w: 7, h: 6 },
      },
    ),
    items: [ItemType.tickets],
    card: { title: 'Frontline' },
    component: TicketOpenSeriesChart,
  },
};
