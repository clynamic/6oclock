export interface NavNode {
  label: React.ReactNode;
  href: string;
  children?: SubNavNode[];
}

export interface SubNavNode {
  label: React.ReactNode;
  href: string;
}

export type NavAction = React.ReactNode;

export const navigationEntries: NavNode[] = [
  {
    label: "Mods",
    href: "/mods",
    children: [
      {
        label: "Dashboard",
        href: "/mods",
      },
      {
        label: "Tickets",
        href: "/mods/tickets",
      },
      {
        label: "Reports",
        href: "/mods/reports",
      },
    ],
  },
  {
    label: "Janitors",
    href: "/janitors",
    children: [
      {
        label: "Dashboard",
        href: "/janitors",
      },
    ],
  },
];
