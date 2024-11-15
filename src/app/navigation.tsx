import { NavNode } from '../page';
import { NavSpacer, NavUser } from '../page';

export const navigationEntries: NavNode[] = [
  {
    label: 'Mods',
    href: '/mods',
    children: [
      {
        label: 'Dashboard',
        href: '/mods',
      },
      {
        label: 'Tickets',
        href: '/mods/tickets',
      },
      {
        label: 'Reports',
        href: '/mods/reports',
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
      },
      {
        label: 'Approvals',
        href: '/janitors/approvals',
      },
      {
        label: 'Uploaders',
        href: '/janitors/uploaders',
      },
    ],
  },
  <NavSpacer />,
  <NavUser />,
];
