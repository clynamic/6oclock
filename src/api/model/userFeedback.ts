/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * e621 API
 * An API for accessing user information and other resources on e621 and e926.
 * OpenAPI spec version: 1.0.0
 */
import type { UserFeedbackCategory } from "./userFeedbackCategory";

/**
 * A user feedback object representing a piece of feedback left by a user.
 */
export interface UserFeedback {
  /** The body of the feedback, containing the details */
  body: string;
  /** The category of the feedback (e.g., negative, positive, neutral) */
  category: UserFeedbackCategory;
  /** The time when the feedback was created */
  created_at: Date;
  /** The ID of the user who created the feedback */
  creator_id: number;
  /** The unique ID of the user feedback */
  id: number;
  /** Whether the feedback is deleted */
  is_deleted: boolean;
  /** The last time the feedback was updated */
  updated_at: Date;
  /** The ID of the user who last updated the feedback */
  updater_id: number;
  /** The ID of the user who received the feedback */
  user_id: number;
}
