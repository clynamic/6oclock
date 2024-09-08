import { Breakpoint } from "@mui/material";

import { DashboardPosition } from "../api";
import { DashboardCardProps } from "./DashboardCard";
import { DashboardLayout, DashboardLayouts } from "./DashboardGrid";

export const breakpoints: Breakpoint[] = ["xs", "sm", "md", "lg", "xl"];

export interface DashboardConstraints {
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export type DashboardItemLayout = Omit<DashboardPosition, "i"> &
  DashboardConstraints;

export type DashboardItemLayouts = Record<string, DashboardItemLayout>;

export type DashboardItemConfig = {
  defaultLayout: DashboardItemLayouts;
  card?: Omit<DashboardCardProps, "children">;
  component: React.FC;
};

export type DashboardCatalog = Record<string, DashboardItemConfig>;

export const createSimpleLayout = (
  base: DashboardItemLayout,
  overrides?: Partial<DashboardItemLayouts>
) => {
  return breakpoints.reduce((acc, breakpoint) => {
    acc[breakpoint] = { ...base, ...overrides?.[breakpoint] };
    return acc;
  }, {} as DashboardItemLayouts);
};

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

export const buildCatalogLayouts = (
  catalog: DashboardCatalog
): DashboardLayouts => {
  return breakpoints.reduce((layouts, breakpoint) => {
    layouts[breakpoint] = buildCatalogLayout(catalog, breakpoint);
    return layouts;
  }, {} as DashboardLayouts);
};
