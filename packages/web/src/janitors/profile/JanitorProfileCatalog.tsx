import { UserCard } from '../../common';
import { createSimpleLayout, DashboardCatalog } from '../../dashboard';
import {
  ApprovalActivitySummaryByApproverChart,
  ApprovalCountSeriesByApproverChart,
} from '../charts';

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
        xs: { x: 0, y: 0, w: 4, h: 2 },
        sm: { x: 0, y: 0, w: 6, h: 2 },
        md: { x: 2, y: 0, w: 5, h: 2 },
        lg: { x: 3, y: 0, w: 6, h: 2 },
        xl: { x: 5, y: 0, w: 6, h: 2 },
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
        xs: { x: 0, y: 7, w: 4, h: 5 },
        sm: { x: 0, y: 7, w: 6, h: 5 },
        md: { x: 2, y: 7, w: 5, h: 5 },
        lg: { x: 3, y: 7, w: 6, h: 5 },
        xl: { x: 5, y: 7, w: 6, h: 5 },
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
        maxH: 6,
      },
      {
        xs: { x: 0, y: 2, w: 4, h: 5 },
        sm: { x: 0, y: 2, w: 6, h: 5 },
        md: { x: 2, y: 2, w: 5, h: 5 },
        lg: { x: 3, y: 2, w: 6, h: 5 },
        xl: { x: 5, y: 2, w: 6, h: 5 },
      },
    ),
    card: { title: 'User Activity' },
    component: ApprovalActivitySummaryByApproverChart,
  },
};
