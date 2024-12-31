import { ReactElement } from 'react';
import { Route } from 'react-router-dom';

import { HealthPage } from '../health';
import { JobsPage } from '../health/jobs';
import { HomePage } from '../home';
import { ApproverPage, JanitorOverviewPage } from '../janitors';
import { PostUploaderPage } from '../janitors/uploads';
import { ModOverviewPage, TicketerPage, TicketReporterPage } from '../mods';
import { NavNode } from '../page';
import { NavSpacer, NavUser } from '../page';
import { ProfilePage } from '../profile';
import { PerformanceDetailPage, PerformancePage } from '../users';

export const appNavNodes: NavNode[] = [
  {
    label: 'Home',
    href: '/',
    hidden: true,
    component: <HomePage />,
  },
  {
    label: 'Mods',
    href: '/mods',
    children: [
      {
        label: 'Dashboard',
        href: '/mods',
        component: <ModOverviewPage />,
      },
      {
        label: 'Performance',
        href: '/mods/performance',
        component: <PerformancePage area="moderator" />,
      },
      {
        label: 'Tickets',
        href: '/mods/tickets',
        component: <TicketerPage />,
      },
      {
        label: 'Reports',
        href: '/mods/reports',
        component: <TicketReporterPage />,
      },
    ],
  },
  {
    label: 'Janitors',
    href: '/janitors',
    children: [
      {
        label: 'Dashboard',
        href: '/janitors',
        component: <JanitorOverviewPage />,
      },
      {
        label: 'Performance',
        href: '/janitors/performance',
        component: <PerformancePage area="janitor" />,
      },
      {
        label: 'Approvals',
        href: '/janitors/approvals',
        component: <ApproverPage />,
      },
      {
        label: 'Uploaders',
        href: '/janitors/uploads',
        component: <PostUploaderPage />,
      },
    ],
  },
  {
    label: 'Users',
    href: '/users',
    hidden: true,
    children: [
      {
        label: 'Profile',
        href: '/users/:id',
        hidden: true,
        component: <ProfilePage />,
      },
      {
        label: 'Performance',
        href: '/users/:id/performance',
        hidden: true,
        component: <PerformanceDetailPage />,
      },
    ],
  },
  {
    label: 'Health',
    href: '/health',
    hidden: true,
    children: [
      {
        label: 'Dashboard',
        href: '/health',
        component: <HealthPage />,
      },
      {
        label: 'Jobs',
        href: '/health/jobs',
        component: <JobsPage />,
      },
    ],
  },
  <NavSpacer />,
  <NavUser />,
];

export const createRoutesFromNodes = (entries: NavNode[]): ReactElement[] =>
  entries.flatMap((entry) =>
    entry == null || typeof entry !== 'object' || !('href' in entry)
      ? []
      : [
          ...(entry.component
            ? [
                <Route
                  key={entry.href}
                  path={entry.href}
                  element={entry.component}
                />,
              ]
            : []),
          ...(entry.children ? createRoutesFromNodes(entry.children) : []),
        ],
  );
