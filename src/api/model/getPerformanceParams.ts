/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * 5-thirty
 * backend data aggregate for 6 o'clock
 * OpenAPI spec version: 0.0.7
 */
import type { TimeScale } from './timeScale';
import type { UserArea } from './userArea';
import type { Activity } from './activity';

export type GetPerformanceParams = {
  scale?: TimeScale;
  cycle?: TimeScale;
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
  area?: UserArea;
  activities?: Activity[];
  userId?: number;
  head?: boolean;
};
