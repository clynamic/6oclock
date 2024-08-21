/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * e621 API
 * An API for accessing user information and other resources on e621 and e926.
 * OpenAPI spec version: 1.0.0
 */

/**
 * The current status of the upload
 */
export type UploadStatus = (typeof UploadStatus)[keyof typeof UploadStatus];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UploadStatus = {
  Completed: "Completed",
  Processing: "Processing",
  Pending: "Pending",
  Duplicate: "Duplicate",
  Error: "Error",
} as const;