/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * e621 API
 * An API for accessing user information and other resources on e621 and e926.
 * OpenAPI spec version: 1.0.0
 */

/**
 * The file extension (e.g., jpg, png, webm)
 */
export type FileExt = (typeof FileExt)[keyof typeof FileExt];

 
export const FileExt = {
  jpg: "jpg",
  png: "png",
  webm: "webm",
} as const;
