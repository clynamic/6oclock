import { ReactElement, Suspense } from 'react';

import { Route, useParams } from 'react-router';

import { useIsTechnician } from '../api';
import { useAuth } from '../auth/context';
import { LoadingPage } from '../page/LoadingPage';
import { NavClock } from '../page/header/NavClock';
import { NavDate } from '../page/header/NavDate';
import { NavSpacer } from '../page/header/NavSpacer';
import { NavUser } from '../page/header/NavUser';
import type { NavNode } from '../page/navigation';
import { ChartParamsExtraProvider } from '../utils/charts';
import {
  HealthPage,
  HomePage,
  JanitorOverviewPage,
  JobDetailPage,
  JobsPage,
  ManifestDetailPage,
  ManifestHealthPage,
  ModOverviewPage,
  PerformanceDetailPage,
  PerformanceTable,
  PostUploaderPage,
  ProfilePage,
  SettingsPage,
  TicketReporterPage,
  TileDetailPage,
  TileHealthPage,
} from './pages';

export const useResolveUserId = (): Record<string, string> => {
  const { id } = useParams<{ id: string }>();
  const { payload } = useAuth();

  return {
    id: id || payload?.userId?.toString() || '',
  };
};

export const useIsHealthHidden = (): boolean => {
  const { isAuthenticated } = useAuth();
  const { data: isTechnician } = useIsTechnician({
    query: { enabled: isAuthenticated },
  });
  return !isTechnician;
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
    hidden: useIsHealthHidden,
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
        children: [
          {
            label: 'Job',
            href: '/health/jobs/*',
            component: <JobDetailPage />,
            hidden: true,
          },
        ],
      },
      {
        label: 'Manifests',
        href: '/health/manifests',
        component: <ManifestHealthPage />,
        children: [
          {
            label: 'Manifest',
            href: '/health/manifests/:type',
            component: <ManifestDetailPage />,
            hidden: true,
          },
        ],
      },
      {
        label: 'Tiles',
        href: '/health/tiles',
        component: <TileHealthPage />,
        children: [
          {
            label: 'Tile',
            href: '/health/tiles/:type',
            component: <TileDetailPage />,
            hidden: true,
          },
        ],
      },
    ],
  },
  {
    label: 'Settings',
    href: '/settings',
    component: <SettingsPage />,
    hidden: true,
  },
  <NavSpacer />,
  <NavClock />,
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
                    <Suspense fallback={<LoadingPage />}>
                      {entry.component}
                    </Suspense>
                  }
                />,
              ]
            : []),
          ...(entry.children ? createRoutesFromNodes(entry.children) : []),
        ],
  );
