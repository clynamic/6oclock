/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * 5-thirty
 * backend data aggregate for 6 o'clock
 * OpenAPI spec version: 0.0.3
 */
import type { ManifestHealthCondition } from './manifestHealthCondition';
import type { IdGap } from './idGap';
import type { ManifestHealthType } from './manifestHealthType';

export interface ManifestHealth {
  condition: ManifestHealthCondition;
  coverage: number;
  endDate: Date;
  gaps: IdGap[];
  id: number;
  startDate: Date;
  type: ManifestHealthType;
}
