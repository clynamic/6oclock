/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * 5-thirty
 * backend data aggregate for 6 o'clock
 * OpenAPI spec version: 0.0.5
 */
import type { TimeScale } from './timeScale';

export type GetTicketStatusSummaryParams = {
  scale?: TimeScale;
  cycle?: TimeScale;
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
};
