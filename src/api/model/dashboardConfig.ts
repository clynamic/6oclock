/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * 5-thirty
 * backend data aggregate for 6 o'clock
 * OpenAPI spec version: 0.0.5
 */
import type { DashboardConfigMeta } from './dashboardConfigMeta';
import type { DashboardConfigType } from './dashboardConfigType';
import type { DashboardPositions } from './dashboardPositions';

export interface DashboardConfig {
  meta: DashboardConfigMeta;
  positions: DashboardPositions;
  type: DashboardConfigType;
  userId: number;
  version: number;
}
