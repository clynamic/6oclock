/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * 5-thirty
 * backend data aggregate for 6 o'clock
 * OpenAPI spec version: 0.0.7
 */

export type Activity = (typeof Activity)[keyof typeof Activity];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Activity = {
  post_create: 'post_create',
  post_delete: 'post_delete',
  post_approve: 'post_approve',
  post_replacement_create: 'post_replacement_create',
  post_replacement_approve: 'post_replacement_approve',
  post_replacement_reject: 'post_replacement_reject',
  ticket_create: 'ticket_create',
  ticket_handle: 'ticket_handle',
} as const;
