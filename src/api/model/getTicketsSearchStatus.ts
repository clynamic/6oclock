/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * e621 API
 * An API for accessing user information and other resources on e621 and e926.
 * OpenAPI spec version: 1.0.0
 */

export type GetTicketsSearchStatus =
  (typeof GetTicketsSearchStatus)[keyof typeof GetTicketsSearchStatus];

 
export const GetTicketsSearchStatus = {
  pending: "pending",
  pending_unclaimed: "pending_unclaimed",
  pending_claimed: "pending_claimed",
  approved: "approved",
  partial: "partial",
} as const;
