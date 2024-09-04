import { Breakpoint } from "@mui/material";

import { DashboardPosition } from "../api";
import { DashboardCardProps } from "./DashboardCard";
import { DashboardLayout } from "./DashboardGrid";

export interface DashboardConstraints {
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export type DashboardItemDefaultLayout = Record<
  string,
  Omit<DashboardPosition, "i"> & DashboardConstraints
>;

export type DashboardItemConfig = {
  defaultLayout: DashboardItemDefaultLayout;
  card?: Omit<DashboardCardProps, "children">;
  component: React.FC;
};

export type DashboardCatalog = Record<string, DashboardItemConfig>;

export const buildCatalogLayout = (
  catalog: DashboardCatalog,
  breakpoint: Breakpoint
): DashboardLayout[] => {
  return Object.entries(catalog).reduce((acc, [key, { defaultLayout }]) => {
    const layout = defaultLayout[breakpoint];
    if (!layout) return acc;
    return [...acc, { i: key, ...layout }];
  }, [] as DashboardLayout[]);
};
