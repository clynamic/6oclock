import { UserCard } from '../common';
import { createLayout, DashboardCatalog } from '../dashboard';
import { UploadsSeriesByUploaderChart } from '../janitors';
import { TicketCreatedSeriesByReporterChart } from '../mods';

export const userProfileCatalog: DashboardCatalog = {
  userHead: {
    name: 'User Head',
    layout: createLayout(
      {
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
  ticketsHandled: {
    name: 'Tickets Created',
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
        md: { x: 2, y: 7, w: 5, h: 5 },
        lg: { x: 5, y: 0, w: 5, h: 5 },
        xl: { x: 5, y: 0, w: 5, h: 5 },
      },
    ),
    card: { title: 'Tickets Created' },
    component: TicketCreatedSeriesByReporterChart,
  },
  postsUploaded: {
    name: 'Posts Uploaded',
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
        md: { x: 2, y: 7, w: 5, h: 5 },
        lg: { x: 5, y: 0, w: 5, h: 5 },
        xl: { x: 5, y: 0, w: 5, h: 5 },
      },
    ),
    card: { title: 'Posts Uploaded' },
    component: UploadsSeriesByUploaderChart,
  },
};
