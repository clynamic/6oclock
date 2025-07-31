import { lazy, ReactElement, Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';

import { useAuth } from '../auth/context';
import { LoadingHint } from '../common/LoadingHint';
import type { NavNode } from '../page/navigation';
import { NavDate } from '../page/header/NavDate';
import { NavHealth } from '../page/header/NavHealth';
import { NavSpacer } from '../page/header/NavSpacer';
import { NavUser } from '../page/header/NavUser';

import { ChartParamsExtraProvider } from '../utils/charts';

const HomePage = lazy(() =>
  import('../home/HomePage').then((m) => ({ default: m.HomePage })),
);
const HealthPage = lazy(() =>
  import('../health/HealthPage').then((m) => ({ default: m.HealthPage })),
);
const JobsPage = lazy(() =>
  import('../health/jobs/JobsPage').then((m) => ({ default: m.JobsPage })),
);
const ManifestHealthPage = lazy(() =>
  import('../health/manifests/ManifestHealthPage').then((m) => ({
    default: m.ManifestHealthPage,
  })),
);
const JanitorOverviewPage = lazy(() =>
  import('../janitors/overview/JanitorOverviewPage').then((m) => ({
    default: m.JanitorOverviewPage,
  })),
);
const PostUploaderPage = lazy(() =>
  import('../janitors/uploads/PostUploaderPage').then((m) => ({
    default: m.PostUploaderPage,
  })),
);
const ModOverviewPage = lazy(() =>
  import('../mods/overview/ModOverviewPage').then((m) => ({
    default: m.ModOverviewPage,
  })),
);
const TicketReporterPage = lazy(() =>
  import('../mods/reports/TicketReporterPage').then((m) => ({
    default: m.TicketReporterPage,
  })),
);
const PerformanceDetailPage = lazy(() =>
  import('../performance/PerformanceDetailPage').then((m) => ({
    default: m.PerformanceDetailPage,
  })),
);
const PerformanceTable = lazy(() =>
  import('../performance/PerformanceTable').then((m) => ({
    default: m.PerformanceTable,
  })),
);
const ProfilePage = lazy(() =>
  import('../profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);

export const useResolveUserId = (): Record<string, string> => {
  const { id } = useParams<{ id: string }>();
  const { payload } = useAuth();

  return {
    id: id || payload?.userId?.toString() || '',
  };
};

export const appNavNodes: NavNode[] = [
  {
    label: 'Home',
    href: '/',
    hidden: true,
    component: <HomePage />,
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
        component: (
          <ChartParamsExtraProvider params={{ area: 'janitor' }}>
            <PerformanceTable />
          </ChartParamsExtraProvider>
        ),
      },
      {
        label: 'Uploaders',
        href: '/janitors/uploads',
        component: <PostUploaderPage />,
      },
    ],
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
        component: (
          <ChartParamsExtraProvider params={{ area: 'moderator' }}>
            <PerformanceTable />
          </ChartParamsExtraProvider>
        ),
      },
      {
        label: 'Reports',
        href: '/mods/reports',
        component: <TicketReporterPage />,
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
        component: <ProfilePage />,
        resolve: useResolveUserId,
      },
      {
        label: 'Performance',
        href: '/performance/:id',
        resolve: useResolveUserId,
      },
    ],
  },
  {
    label: 'Performance',
    href: '/performance',
    hidden: true,
    children: [
      {
        label: 'Performance',
        href: '/performance/:id',
        component: <PerformanceDetailPage />,
        hidden: true,
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
      {
        label: 'Manifests',
        href: '/health/manifests',
        component: <ManifestHealthPage />,
      },
    ],
  },
  <NavHealth />,
  <NavSpacer />,
  <NavDate />,
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
                  element={
                    <Suspense fallback={<LoadingHint />}>
                      {entry.component}
                    </Suspense>
                  }
                />,
              ]
            : []),
          ...(entry.children ? createRoutesFromNodes(entry.children) : []),
        ],
  );
