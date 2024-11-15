import { createSimpleLayout, DashboardCatalog } from '../../dashboard';
import {
  TicketOpenSeriesChart,
  TicketStatusSeriesChart,
  TicketStatusSummaryChart,
  TicketTypeSummaryChart,
} from '../charts';
import { TicketReporterBoard } from '../reports';
import { TicketerLeaderboard } from '../tickets';

export const modDashoardCatalogVersion = 2;

export const modDashboardCatalog: DashboardCatalog = {
  ticketLeaderboard: {
    name: 'Top Ticket Handlers',
    defaultLayout: createSimpleLayout(
      {
        x: 0,
        y: 0,
        w: 6,
        h: 11,
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
        xl: { x: 0, y: 0, w: 6, h: 11 },
      },
    ),
    card: {
      title: 'Tickets',
      variant: 'outlined',
    },
    component: TicketerLeaderboard,
  },
  ticketStatus: {
    name: 'All Tickets Status',
    defaultLayout: createSimpleLayout(
      {
        x: 6,
        y: 0,
        w: 5,
        h: 5,
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
        xl: { x: 6, y: 0, w: 6, h: 5 },
      },
    ),
    card: { title: 'Status' },
    component: TicketStatusSummaryChart,
  },
  ticketType: {
    name: 'All Tickets Type',
    defaultLayout: createSimpleLayout(
      {
        x: 11,
        y: 0,
        w: 5,
        h: 6,
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
        xl: { x: 6, y: 5, w: 6, h: 6 },
      },
    ),
    card: { title: 'Type' },
    component: TicketTypeSummaryChart,
  },
  ticketTurnaround: {
    name: 'Tickets Opened/Closed by Day',
    defaultLayout: createSimpleLayout(
      {
        x: 0,
        y: 11,
        w: 8,
        h: 5,
        minW: 4,
        minH: 3,
        maxH: 9,
      },
      {
        xs: { x: 0, y: 33, w: 4, h: 5 },
        sm: { x: 0, y: 22, w: 6, h: 5 },
        md: { x: 0, y: 11, w: 6, h: 5 },
        lg: { x: 0, y: 11, w: 7, h: 5 },
        xl: { x: 0, y: 11, w: 8, h: 5 },
      },
    ),
    card: { title: 'Turnaround' },
    component: TicketStatusSeriesChart,
  },
  ticketReporters: {
    name: 'Top Ticket Reporters',
    defaultLayout: createSimpleLayout(
      {
        x: 8,
        y: 11,
        w: 4,
        h: 11,
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
        xl: { x: 12, y: 0, w: 4, h: 11 },
      },
    ),
    card: { title: 'Reporters', variant: 'outlined' },
    component: TicketReporterBoard,
  },
  ticketsOpened: {
    name: 'Tickets Open by Day',
    defaultLayout: createSimpleLayout(
      {
        x: 12,
        y: 11,
        w: 4,
        h: 5,
        minW: 4,
        minH: 3,
        maxH: 9,
      },
      {
        xs: { x: 0, y: 38, w: 4, h: 5 },
        sm: { x: 0, y: 27, w: 6, h: 5 },
        md: { x: 0, y: 16, w: 6, h: 5 },
        lg: { x: 7, y: 11, w: 5, h: 5 },
        xl: { x: 8, y: 11, w: 8, h: 5 },
      },
    ),
    card: { title: 'Frontline' },
    component: TicketOpenSeriesChart,
  },
};
