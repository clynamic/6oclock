import { DashboardCardProps } from "./DashboardCard";

export type DashboardItemConfig<T = unknown> = Omit<
  DashboardCardProps,
  "children"
> & {
  component: React.FC<T>;
};

export type DashboardCatalog<T = unknown> = Record<
  string,
  DashboardItemConfig<T>
>;
