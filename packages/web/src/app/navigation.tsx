import { ReactElement } from 'react';
import { Route } from 'react-router-dom';

import { ApproverPage, JanitorOverviewPage } from '../janitors';
import { PostUploaderPage } from '../janitors/uploads';
import { ModOverviewPage, TicketerPage, TicketReporterPage } from '../mods';
import { NavNode } from '../page';
import { NavSpacer, NavUser } from '../page';

export const appNavNodes: NavNode[] = [
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
