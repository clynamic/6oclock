/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * 5-thirty
 * backend data aggregate for 6 o'clock
 * OpenAPI spec version: 0.0.2
 */

export interface UserCredentials {
  /** @pattern /^[a-zA-Z0-9]{24,32}$/ */
  password: string;
  /** @minLength 1 */
  username: string;
}
