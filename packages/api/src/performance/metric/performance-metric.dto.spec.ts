import { UserLevel } from 'src/auth/auth.level';

import {
  Activity,
  PerformanceGrade,
  TrendGrade,
  UserArea,
  getActivityScore,
  getPerformanceScoreGrade,
  getPerformanceTrendGrade,
  getUserAreaFromLevel,
} from './performance-metric.dto';

const areas: Record<UserLevel, UserArea> = {
  [UserLevel.Anonymous]: UserArea.Member,
  [UserLevel.Blocked]: UserArea.Member,
  [UserLevel.Member]: UserArea.Member,
  [UserLevel.Privileged]: UserArea.Member,
  [UserLevel.FormerStaff]: UserArea.Member,
  [UserLevel.Staff]: UserArea.Member,
  [UserLevel.Janitor]: UserArea.Janitor,
  [UserLevel.Moderator]: UserArea.Moderator,
  [UserLevel.Admin]: UserArea.Admin,
};

const scores: Record<Activity, number> = {
  [Activity.PostCreate]: 0,
  [Activity.PostDelete]: 1.25,
  [Activity.PostApprove]: 1,
  [Activity.PostReplacementCreate]: 0,
  [Activity.PostReplacementApprove]: 1.1,
  [Activity.PostReplacementPromote]: 1.1,
  [Activity.PostReplacementReject]: 1.1,
  [Activity.FlagHandle]: 1.1,
  [Activity.TicketCreate]: 0,
  [Activity.TicketHandle]: 1,
};

describe('getUserAreaFromLevel', () => {
  it.each(Object.entries(areas))('maps level %s to %s', (level, area) => {
    expect(getUserAreaFromLevel(Number(level))).toBe(area);
  });

  it('maps a level it has never heard of to the member area', () => {
    expect(getUserAreaFromLevel(45 as UserLevel)).toBe(UserArea.Member);
  });

  it('maps a missing level to the member area', () => {
    expect(getUserAreaFromLevel(undefined)).toBe(UserArea.Member);
  });

  it('gives staff the member area, since staff take none of the actions we score', () => {
    expect(getUserAreaFromLevel(UserLevel.Staff)).toBe(UserArea.Member);
  });
});

describe('getActivityScore', () => {
  it.each(Object.entries(scores))('scores %s at %s', (activity, score) => {
    expect(getActivityScore(activity as Activity)).toBe(score);
  });

  it('scores an activity it has never heard of at zero', () => {
    expect(getActivityScore('post_undelete' as Activity)).toBe(0);
  });

  it('weighs a deletion above an approval', () => {
    expect(getActivityScore(Activity.PostDelete)).toBeGreaterThan(
      getActivityScore(Activity.PostApprove),
    );
  });

  it('scores creating a post or a ticket at nothing', () => {
    expect(getActivityScore(Activity.PostCreate)).toBe(0);
    expect(getActivityScore(Activity.TicketCreate)).toBe(0);
    expect(getActivityScore(Activity.PostReplacementCreate)).toBe(0);
  });
});

describe('getPerformanceScoreGrade', () => {
  it.each([
    [-1, PerformanceGrade.F],
    [0, PerformanceGrade.F],
    [4.99, PerformanceGrade.F],
    [5, PerformanceGrade.E],
    [19.99, PerformanceGrade.E],
    [20, PerformanceGrade.D],
    [49.99, PerformanceGrade.D],
    [50, PerformanceGrade.C],
    [74.99, PerformanceGrade.C],
    [75, PerformanceGrade.B],
    [99.99, PerformanceGrade.B],
    [100, PerformanceGrade.A],
    [149.99, PerformanceGrade.A],
    [150, PerformanceGrade.S],
    [199.99, PerformanceGrade.S],
    [200, PerformanceGrade.S2],
    [250, PerformanceGrade.S3],
    [300, PerformanceGrade.S4],
    [350, PerformanceGrade.S5],
    [400, PerformanceGrade.S6],
    [10000, PerformanceGrade.S6],
  ])('grades a score of %s as %s', (score, grade) => {
    expect(getPerformanceScoreGrade(score)).toBe(grade);
  });

  it('opens each band on its threshold, closing the one below', () => {
    expect(getPerformanceScoreGrade(5)).not.toBe(
      getPerformanceScoreGrade(4.99),
    );
  });
});

describe('getPerformanceTrendGrade', () => {
  it.each([
    [-1000, TrendGrade.plummet],
    [-75.01, TrendGrade.plummet],
    [-75, TrendGrade.drop],
    [-25.01, TrendGrade.drop],
    [-25, TrendGrade.decline],
    [-0.01, TrendGrade.decline],
    [0, TrendGrade.neutral],
    [24.99, TrendGrade.neutral],
    [25, TrendGrade.rise],
    [49.99, TrendGrade.rise],
    [50, TrendGrade.climb],
    [99.99, TrendGrade.climb],
    [100, TrendGrade.surge],
    [1000, TrendGrade.surge],
  ])('grades a trend of %s as %s', (trend, grade) => {
    expect(getPerformanceTrendGrade(trend)).toBe(grade);
  });

  it('reads no change as neutral rather than a decline', () => {
    expect(getPerformanceTrendGrade(0)).toBe(TrendGrade.neutral);
  });
});
