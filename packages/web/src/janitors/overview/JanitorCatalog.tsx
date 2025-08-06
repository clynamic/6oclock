import { ItemType } from '../../api';
import { DashboardCatalog, createLayout } from '../../dashboard/DashboardItem';
import { PerformanceLeaderboard } from '../../performance/PerformanceBoard';
import { PostPendingSeriesChart } from '../charts/PostPendingSeriesChart';
import { PostStatusSeriesChart } from '../charts/PostStatusSeriesChart';
import { PostStatusSummaryChart } from '../charts/PostStatusSummaryChart';
import { PostReplacementStatusSeriesChart } from '../charts/ReplacementStatusSeriesChart';
import { PostUploaderBoard } from '../uploads/PostUploaderBoard';

export const janitorDashboardCatalogVersion = 3;

export const janitorDashboardCatalog: DashboardCatalog = {
  performanceLeaderboard: {
    name: 'Performance Leaderboard',
    component: PerformanceLeaderboard,
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
        md: { x: 5, y: 0, w: 4, h: 18 },
        lg: { x: 8, y: 0, w: 4, h: 18 },
        xl: { x: 11, y: 0, w: 5, h: 18 },
      },
    ),
    card: {
      title: 'Performance',
      variant: 'outlined',
    },
  },
  postStatus: {
    name: 'Post Status Summary',
    component: PostStatusSummaryChart,
    layout: createLayout(
      {
        minW: 3,
        maxW: 8,
        minH: 4,
        maxH: 9,
      },
      {
        xs: { x: 0, y: 11, w: 4, h: 6 },
        sm: { x: 0, y: 11, w: 6, h: 5 },
        md: { x: 0, y: 0, w: 5, h: 5 },
        lg: { x: 0, y: 0, w: 3, h: 5 },
        xl: { x: 0, y: 0, w: 4, h: 5 },
      },
    ),
    items: [ItemType.post_versions, ItemType.post_events, ItemType.flags],
    card: { title: 'Status' },
  },
  postTurnaround: {
    name: 'Posts Approved/Deleted',
    component: PostStatusSeriesChart,
    layout: createLayout(
      {
        minW: 4,
        minH: 3,
        maxH: 9,
      },
      {
        xs: { x: 0, y: 17, w: 4, h: 6 },
        sm: { x: 0, y: 16, w: 6, h: 5 },
        md: { x: 0, y: 5, w: 5, h: 6 },
        lg: { x: 3, y: 0, w: 5, h: 6 },
        xl: { x: 4, y: 0, w: 7, h: 6 },
      },
    ),
    items: [ItemType.post_versions, ItemType.post_events, ItemType.flags],
    card: { title: 'Turnaround' },
  },
  postUploaders: {
    name: 'Top Post Uploaders',
    layout: createLayout(
      {
        minW: 2,
        maxW: 4,
        minH: 7,
        maxH: 15,
      },
      {
        xs: { x: 0, y: 29, w: 4, h: 11 },
        sm: { x: 1, y: 26, w: 4, h: 11 },
        md: { x: 5, y: 11, w: 4, h: 13 },
        lg: { x: 0, y: 5, w: 3, h: 13 },
        xl: { x: 0, y: 5, w: 4, h: 13 },
      },
    ),
    items: [ItemType.post_versions],
    card: { title: 'Uploaders', variant: 'outlined' },
    component: PostUploaderBoard,
  },
  postsPending: {
    name: 'Posts Pending by Day',
    layout: createLayout(
      {
        minW: 4,
        minH: 3,
        maxH: 9,
      },
      {
        xs: { x: 0, y: 23, w: 4, h: 6 },
        sm: { x: 0, y: 21, w: 6, h: 5 },
        md: { x: 0, y: 11, w: 5, h: 6 },
        lg: { x: 3, y: 6, w: 5, h: 6 },
        xl: { x: 4, y: 6, w: 7, h: 6 },
      },
    ),
    card: { title: 'Frontline' },
    items: [ItemType.post_versions, ItemType.post_events, ItemType.flags],
    component: PostPendingSeriesChart,
  },
  postReplacements: {
    name: 'Post Replacement Status',
    layout: createLayout(
      {
        minW: 4,
        minH: 3,
        maxH: 9,
      },
      {
        xs: { x: 0, y: 23, w: 4, h: 6 },
        sm: { x: 0, y: 21, w: 6, h: 5 },
        md: { x: 0, y: 11, w: 5, h: 6 },
        lg: { x: 3, y: 6, w: 5, h: 6 },
        xl: { x: 4, y: 6, w: 7, h: 6 },
      },
    ),
    card: { title: 'Replacements' },
    items: [ItemType.post_replacements],
    component: PostReplacementStatusSeriesChart,
  },
};
