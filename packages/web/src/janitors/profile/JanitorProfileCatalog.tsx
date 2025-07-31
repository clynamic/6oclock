import { UserCard } from '../../common/UserCard';
import { DashboardCatalog, createLayout } from '../../dashboard/DashboardItem';
import { PerformanceCard } from '../../performance/PerformanceCard';
import { UserActivitySeriesChart } from '../../users/charts/UserActivitySeriesChart';
import { ApprovalCountSeriesByApproverChart } from '../charts/ApprovalCountSeriesByApproverChart';

export const janitorProfileCatalog: DashboardCatalog = {
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
        md: { x: 2, y: 0, w: 5, h: 2 },
        lg: { x: 0, y: 0, w: 5, h: 2 },
        xl: { x: 0, y: 0, w: 5, h: 2 },
      },
    ),
    component: UserCard,
  },
  postsHandled: {
    name: 'Posts Handled',
    layout: createLayout(
      {
        minW: 2,
        maxW: undefined,
        minH: 2,
        maxH: 6,
      },
      {
        xs: { x: 0, y: 7, w: 4, h: 5 },
        sm: { x: 0, y: 7, w: 6, h: 5 },
        md: { x: 2, y: 7, w: 5, h: 5 },
        lg: { x: 5, y: 0, w: 5, h: 5 },
        xl: { x: 5, y: 0, w: 5, h: 5 },
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
        xs: { x: 0, y: 2, w: 4, h: 5 },
        sm: { x: 0, y: 2, w: 6, h: 5 },
        md: { x: 2, y: 2, w: 5, h: 5 },
        lg: { x: 0, y: 2, w: 5, h: 5 },
        xl: { x: 0, y: 2, w: 5, h: 5 },
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
        maxW: 6,
        minH: 2,
        maxH: 5,
      },
      {
        xs: { x: 0, y: 7, w: 4, h: 5 },
        sm: { x: 0, y: 7, w: 6, h: 5 },
        md: { x: 2, y: 7, w: 5, h: 5 },
        lg: { x: 0, y: 7, w: 5, h: 5 },
        xl: { x: 0, y: 7, w: 5, h: 5 },
      },
    ),
    card: { title: 'Activity' },
    component: UserActivitySeriesChart,
  },
};
