/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * 5-thirty
 * backend data aggregate for 6 o'clock
 * OpenAPI spec version: 0.0.3
 */
import type { GetUploadCountScale } from './getUploadCountScale';

export type GetUploadCountParams = {
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
  scale?: GetUploadCountScale;
  uploaderId?: number;
};