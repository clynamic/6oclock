import { createSimpleLayout, DashboardCatalog } from '../../dashboard';
import { ApproverBoard } from '../approvals';
import { PostStatusCountSeriesChart } from '../charts';
import { PostPendingSeriesChart } from '../charts/PostPendingSeriesChart';
import { PostStatusSummaryChart } from '../charts/PostStatusSummaryChart';
import { PostUploaderBoard } from '../uploads';

export const janitorDashboardCatalog: DashboardCatalog = {
  approvalsLeaderboard: {
    name: 'Top Approvers',
    component: ApproverBoard,
    defaultLayout: createSimpleLayout(
      {
        x: 0,
        y: 0,
        w: 4,
        h: 11,
        minW: 3,
        maxW: 6,
        minH: 9,
        maxH: 20,
      },
      {
        xs: { x: 0, y: 0, w: 4, h: 11 },
        sm: { x: 0, y: 0, w: 4, h: 11 },
        md: { x: 0, y: 0, w: 4, h: 11 },
        lg: { w: 4, h: 11, x: 0, y: 0 },
        xl: { x: 0, y: 0, w: 6, h: 11 },
      },
    ),
    card: {
      title: 'Approvals',
      variant: 'outlined',
    },
  },
  postStatus: {
    name: 'Post Status Summary',
    component: PostStatusSummaryChart,
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
        xs: { w: 4, h: 5, x: 0, y: 11 },
        sm: { w: 4, h: 5, x: 0, y: 11 },
        md: { w: 5, h: 5, x: 4, y: 0 },
        lg: { w: 5, h: 5, x: 4, y: 0 },
        xl: { w: 5, h: 5, x: 6, y: 0 },
      },
    ),
    card: { title: 'Post Status' },
  },
  postTurnaround: {
    name: 'Posts Approved/Deleted',
    component: PostStatusCountSeriesChart,
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
        xs: { w: 4, h: 5, x: 0, y: 33 },
        sm: { w: 6, h: 5, x: 0, y: 22 },
        md: { w: 6, h: 5, x: 0, y: 11 },
        lg: { w: 7, h: 5, x: 0, y: 11 },
        xl: { w: 8, h: 5, x: 0, y: 11 },
      },
    ),
    card: { title: 'Turnaround' },
  },
  postUploaders: {
    name: 'Top Post Uploaders',
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
        xs: { w: 4, h: 11, x: 0, y: 22 },
        sm: { w: 2, h: 11, x: 4, y: 11 },
        md: { w: 3, h: 10, x: 6, y: 11 },
        lg: { w: 3, h: 11, x: 9, y: 0 },
        xl: { w: 4, h: 11, x: 11, y: 0 },
      },
    ),
    card: { title: 'Uploaders', variant: 'outlined' },
    component: PostUploaderBoard,
  },
  postsPending: {
    name: 'Posts Pending by Day',
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
        xs: { w: 4, h: 5, x: 0, y: 38 },
        sm: { w: 6, h: 5, x: 0, y: 27 },
        md: { w: 6, h: 5, x: 0, y: 16 },
        lg: { w: 5, h: 5, x: 7, y: 11 },
        xl: { w: 8, h: 5, x: 8, y: 11 },
      },
    ),
    card: { title: 'Frontline' },
    component: PostPendingSeriesChart,
  },
};
