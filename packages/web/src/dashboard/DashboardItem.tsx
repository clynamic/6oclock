import { DashboardCardProps } from "./DashboardCard";

export interface DashboardConstraints {
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export type DashboardItemConfig<T = unknown> = {
  constraints?: DashboardConstraints;
  card?: Omit<DashboardCardProps, "children">;
  component: React.FC<T>;
};

export type DashboardCatalog<T = unknown> = Record<
  string,
  DashboardItemConfig<T>
>;
