import { UserCard } from '../../common';
import { createSimpleLayout, DashboardCatalog } from '../../dashboard';
import { ApproverActivityChart, ApproverChart } from '../charts';

export const janitorProfileCatalog: DashboardCatalog = {
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
        sm: { w: 4, h: 2, x: 0, y: 0 },
        md: { w: 5, h: 2, x: 0, y: 0 },
        lg: { w: 5, h: 2, x: 0, y: 0 },
        xl: { w: 5, h: 2, x: 0, y: 0 },
      },
    ),
    component: UserCard,
  },
  postsHandled: {
    name: 'Posts Handled',
    defaultLayout: createSimpleLayout(
      {
        x: 0,
        y: 2,
        w: 5,
        h: 5,
        minW: 2,
        maxW: undefined,
        minH: 2,
        maxH: 6,
      },
      {
        xs: { w: 4, h: 5, x: 0, y: 5 },
        sm: { w: 4, h: 5, x: 0, y: 5 },
        md: { w: 5, h: 5, x: 0, y: 5 },
        lg: { w: 5, h: 5, x: 0, y: 5 },
        xl: { w: 5, h: 5, x: 0, y: 5 },
      },
    ),
    card: { title: 'Posts Handled' },
    component: ApproverChart,
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
        maxH: 6,
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
    component: ApproverActivityChart,
  },
};
