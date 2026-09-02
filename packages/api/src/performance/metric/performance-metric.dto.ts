import { ApiProperty } from '@nestjs/swagger';
import { PostEventAction } from 'src/api';
import { UserLevel } from 'src/auth/auth.level';
import { ConvertKeysToCamelCase, DateRange, Raw } from 'src/common';
import { UserHead } from 'src/user/head/user-head.dto';

export enum Activity {
  // Many more, which we are currently not syncing.
  PostCreate = 'post_create',
  PostDelete = 'post_delete',
  PostApprove = 'post_approve',
  PostReplacementCreate = 'post_replacement_create',
  PostReplacementApprove = 'post_replacement_approve',
  PostReplacementPromote = 'post_replacement_promote',
  PostReplacementReject = 'post_replacement_reject',
  FlagHandle = 'flag_handle',
  TicketCreate = 'ticket_create',
  TicketHandle = 'ticket_handle',
}

export enum UserArea {
  Admin = 'admin',
  Moderator = 'moderator',
  Janitor = 'janitor',
  Member = 'member',
}

export class ActivitySummary implements ConvertKeysToCamelCase<
  Record<Activity, number>
> {
  constructor(value: Raw<ActivitySummary>) {
    Object.assign(this, value);
  }

  postCreate: number;
  postDelete: number;
  postApprove: number;
  postReplacementCreate: number;
  postReplacementApprove: number;
  postReplacementReject: number;
  postReplacementPromote: number;
  flagHandle: number;
  ticketCreate: number;
  ticketHandle: number;
}

export class PerformanceSummaryQuery {
  constructor(value: Raw<PerformanceSummaryQuery>) {
    Object.assign(this, value);
  }

  userId?: number;
  head?: boolean;

  @ApiProperty({ enum: UserArea, enumName: 'UserArea' })
  area?: UserArea;
  @ApiProperty({ type: String, isArray: true, required: false })
  activities?: string[];
}

export const getUserAreaFromLevel = (level?: UserLevel): UserArea => {
  switch (level) {
    case UserLevel.Admin:
      return UserArea.Admin;
    case UserLevel.Moderator:
      return UserArea.Moderator;
    case UserLevel.Janitor:
      return UserArea.Janitor;
    default:
      return UserArea.Member;
  }
};

export const TICKET_UPDATE_ACTION = 'ticket_update';

export interface Companion {
  anchor: string;
  riders: string[];
  sameTarget: boolean;
  windowMs: number;
}

export const COMPANIONS: readonly Companion[] = [
  {
    anchor: 'user_ban',
    riders: ['user_feedback_create'],
    sameTarget: true,
    windowMs: 5 * 1000,
  },
  {
    anchor: 'takedown_process',
    riders: [
      'artist_user_linked',
      'artist_user_unlinked',
      'avoid_posting_create',
      'avoid_posting_update',
      'avoid_posting_delete',
      'artist_page_rename',
      'wiki_page_delete',
    ],
    sameTarget: false,
    windowMs: 10 * 60 * 1000,
  },
];

const STAFF_SECONDS: Record<string, number> = {
  staff_note_create: 33,
  staff_note_update: 4,
  staff_note_delete: 2,
  user_uploads_toggle: 7,
  artist_user_linked: 300,
  artist_user_unlinked: 1,
  pool_delete: 10,
  wiki_page_lock: 91,
};

export const JANITOR_WORK_SECONDS: Record<string, number> = {
  [PostEventAction.approved]: 6,
  [PostEventAction.deleted]: 17,
  [PostEventAction.expunged]: 17,
  [PostEventAction.undeleted]: 6,
  [PostEventAction.replacement_accepted]: 20,
  [PostEventAction.replacement_rejected]: 20,
  [PostEventAction.replacement_promoted]: 20,
  [PostEventAction.replacement_deleted]: 3,
  [PostEventAction.replacement_penalty_changed]: 2,
  [PostEventAction.flag_removed]: 51,
};

export const MODERATOR_WORK_SECONDS: Record<string, number> = {
  ticket_update_approved: 200,
  ticket_update_partial: 6,
  user_ban: 34,
  user_unban: 60,
  user_ban_update: 10,
  user_feedback_create: 34,
  user_feedback_update: 41,
  user_feedback_delete: 13,
  user_feedback_destroy: 26,
  user_feedback_undelete: 13,
  comment_hide: 2,
  comment_delete: 1,
  comment_unhide: 2,
  forum_post_hide: 4,
  forum_post_update: 50,
  forum_post_unhide: 2,
  forum_topic_hide: 5,
  forum_topic_lock: 4,
  forum_topic_unhide: 2,
  forum_topic_unlock: 2,
  forum_topic_unstick: 2,
  blip_hide: 4,
  blip_update: 3,
};

export const AIBUR_APPROVED = 'aibur_approved';
export const AIBUR_REJECTED = 'aibur_rejected';
export const AIBUR_RETIRED = 'aibur_retired';
const TAG_RELATIONSHIP_UPDATES = ['tag_alias_update', 'tag_implication_update'];

/// PLACEHOLDERS! DO NOT USE THESE NUMBERS FOR THE ADMIN BOARD!
export const ADMIN_WORK_SECONDS: Record<string, number> = {
  takedown_process: 100,
  avoid_posting_create: 60,
  avoid_posting_update: 30,
  avoid_posting_delete: 10,
  [AIBUR_APPROVED]: 50,
  [AIBUR_REJECTED]: 50,
  [AIBUR_RETIRED]: 30,
};

export interface Burst {
  keys: string[];
  windowMs: number;
}

export const BURSTS: readonly Burst[] = [
  {
    keys: [AIBUR_APPROVED, AIBUR_REJECTED, AIBUR_RETIRED],
    windowMs: 10 * 1000,
  },
];

export const JANITOR_SECONDS: Record<string, number> = {
  ...JANITOR_WORK_SECONDS,
  ...STAFF_SECONDS,
};

export const MODERATOR_SECONDS: Record<string, number> = {
  ...MODERATOR_WORK_SECONDS,
  ...STAFF_SECONDS,
};

export const ADMIN_SECONDS: Record<string, number> = {
  ...ADMIN_WORK_SECONDS,
  ...STAFF_SECONDS,
};

export const getBoardWeights = (area: UserArea): Record<string, number> => {
  switch (area) {
    case UserArea.Janitor:
      return JANITOR_SECONDS;
    case UserArea.Moderator:
      return MODERATOR_SECONDS;
    case UserArea.Admin:
      return ADMIN_SECONDS;
    default:
      return {};
  }
};

export const getBoardWork = (area: UserArea): string[] => {
  switch (area) {
    case UserArea.Janitor:
      return Object.keys(JANITOR_WORK_SECONDS);
    case UserArea.Moderator:
      return Object.keys(MODERATOR_WORK_SECONDS);
    case UserArea.Admin:
      return Object.keys(ADMIN_WORK_SECONDS);
    default:
      return [];
  }
};

const POST_EVENT_ACTIONS = new Set<string>(Object.values(PostEventAction));

export const isPostEventAction = (key: string): key is PostEventAction =>
  POST_EVENT_ACTIONS.has(key);

export const getActionWeight = (area: UserArea, key: string): number =>
  getBoardWeights(area)[key] ?? 0;

const AIBUR_TRANSITIONS: Array<[string, string]> = [
  ['changed status from "pending" to "queued"', AIBUR_APPROVED],
  ['changed status from "pending" to "deleted"', AIBUR_REJECTED],
  ['changed status from "active" to "deleted"', AIBUR_RETIRED],
];

export const getModActionKey = (
  action: string,
  values: Record<string, unknown> | undefined,
): string => {
  if (action === TICKET_UPDATE_ACTION) {
    return `${TICKET_UPDATE_ACTION}_${String(values?.['status'] ?? 'none')}`;
  }
  if (TAG_RELATIONSHIP_UPDATES.includes(action)) {
    const change = String(values?.['change_desc'] ?? '');
    const match = AIBUR_TRANSITIONS.find(([prefix]) =>
      change.startsWith(prefix),
    );
    return match ? match[1] : action;
  }
  return action;
};

export const isOnOwnContent = (
  creatorId: number,
  values: Record<string, unknown> | undefined,
): boolean => Number(values?.['user_id']) === creatorId;

export const getModActionSources = (key: string): string[] => {
  if (key.startsWith(`${TICKET_UPDATE_ACTION}_`)) return [TICKET_UPDATE_ACTION];
  if (key.startsWith('aibur_')) return TAG_RELATIONSHIP_UPDATES;
  return [key];
};

export enum PerformanceGrade {
  F = 'F',
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S',
  S2 = 'S2',
  S3 = 'S3',
  S4 = 'S4',
  S5 = 'S5',
  S6 = 'S6',
}

export const SCORE_UNIT_SECONDS = 6;

export const toScore = (seconds: number): number =>
  Math.round(seconds / SCORE_UNIT_SECONDS);

export const getWindowCoverage = (
  range: DateRange,
  now = new Date(),
): number => {
  const span = range.endDate.getTime() - range.startDate.getTime();
  if (span <= 0) return 1;
  const elapsed = now.getTime() - range.startDate.getTime();
  return Math.min(1, Math.max(0, elapsed / span));
};

export const getMiddleMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const from = Math.floor(sorted.length / 4);
  const to = Math.ceil((3 * sorted.length) / 4);
  const middle = sorted.slice(from, to);
  return middle.reduce((acc, value) => acc + value, 0) / middle.length;
};

export const getStanding = (scores: number[], score: number): number => {
  const typical = getMiddleMean(scores);
  if (typical <= 0) return score > 0 ? Infinity : 0;
  return (score / typical) * 100;
};

export const getPerformanceScoreGrade = (percent: number): PerformanceGrade => {
  if (percent < 10) return PerformanceGrade.F;
  if (percent < 20) return PerformanceGrade.E;
  if (percent < 50) return PerformanceGrade.D;
  if (percent < 75) return PerformanceGrade.C;
  if (percent < 100) return PerformanceGrade.B;
  if (percent < 150) return PerformanceGrade.A;
  if (percent < 200) return PerformanceGrade.S;
  if (percent < 400) return PerformanceGrade.S2;
  if (percent < 800) return PerformanceGrade.S3;
  if (percent < 1600) return PerformanceGrade.S4;
  if (percent < 3200) return PerformanceGrade.S5;
  return PerformanceGrade.S6;
};

export enum TrendGrade {
  plummet = 'plummet',
  drop = 'drop',
  decline = 'decline',
  neutral = 'neutral',
  rise = 'rise',
  climb = 'climb',
  surge = 'surge',
}

export const getPerformanceTrendGrade = (trend: number): TrendGrade => {
  if (trend < -75) return TrendGrade.plummet;
  if (trend < -25) return TrendGrade.drop;
  if (trend < 0) return TrendGrade.decline;
  if (trend < 25) return TrendGrade.neutral;
  if (trend < 50) return TrendGrade.rise;
  if (trend < 100) return TrendGrade.climb;
  return TrendGrade.surge;
};

export class PerformanceRecord {
  constructor(value: Raw<PerformanceRecord>) {
    Object.assign(this, value);
  }

  score: number;
  @ApiProperty({ enum: PerformanceGrade, enumName: 'PerformanceGrade' })
  grade: PerformanceGrade;
}

export class PerformanceSummary {
  constructor(value: Raw<PerformanceSummary>) {
    Object.assign(this, value);
  }

  userId: number;
  head?: UserHead;

  position: number;
  score: number;
  @ApiProperty({ enum: PerformanceGrade, enumName: 'PerformanceGrade' })
  scoreGrade: PerformanceGrade;
  trend: number;
  @ApiProperty({ enum: TrendGrade, enumName: 'TrendGrade' })
  trendGrade: TrendGrade;

  history: PerformanceRecord[];
  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  activity: Record<string, number>;
  attendance: Date[];
}

export class PerformanceSeriesQuery {
  constructor(value: Raw<PerformanceSeriesQuery>) {
    Object.assign(this, value);
  }

  userId?: number;
  @ApiProperty({ enum: UserArea, enumName: 'UserArea' })
  area?: UserArea;
}

export class PerformanceSeriesPoint {
  constructor(value: Raw<PerformanceSeriesPoint>) {
    Object.assign(this, value);
  }

  date: Date;
  score: number;
  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  scores: Record<string, number>;
}

export class PerformanceWeightsQuery {
  constructor(value: Raw<PerformanceWeightsQuery>) {
    Object.assign(this, value);
  }

  @ApiProperty({ enum: UserArea, enumName: 'UserArea' })
  area?: UserArea;
}

export class PerformanceWeights {
  constructor(value: Raw<PerformanceWeights>) {
    Object.assign(this, value);
  }

  @ApiProperty({ enum: UserArea, enumName: 'UserArea' })
  area: UserArea;
  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  weights: Record<string, number>;
}

export class ActivitySummaryQuery {
  constructor(value: Raw<ActivitySummaryQuery>) {
    Object.assign(this, value);
  }

  userId?: number;
  @ApiProperty({ enum: UserArea, enumName: 'UserArea' })
  area?: UserArea;
  @ApiProperty({ enum: Activity, enumName: 'Activity', isArray: true })
  activities?: Activity[];
}

export class ActivitySeriesPoint extends ActivitySummary {
  constructor(value: Raw<ActivitySeriesPoint>) {
    super(value);
  }

  date: Date;
}
