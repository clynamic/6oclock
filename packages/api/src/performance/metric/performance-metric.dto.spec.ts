import { UserLevel } from 'src/auth/auth.level';
import { DateRange } from 'src/common';

import {
  ADMIN_SECONDS,
  JANITOR_SECONDS,
  MODERATOR_SECONDS,
  PerformanceGrade,
  TrendGrade,
  UserArea,
  getActionWeight,
  getBoardWeights,
  getBoardWork,
  getMiddleMean,
  getModActionKey,
  getModActionSources,
  getPerformanceScoreGrade,
  getPerformanceTrendGrade,
  getStanding,
  getUserAreaFromLevel,
  getWindowCoverage,
  isOnOwnContent,
  toScore,
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
});

describe('board weights', () => {
  it('gives each area its own table', () => {
    expect(getBoardWeights(UserArea.Janitor)).toBe(JANITOR_SECONDS);
    expect(getBoardWeights(UserArea.Moderator)).toBe(MODERATOR_SECONDS);
    expect(getBoardWeights(UserArea.Admin)).toBe(ADMIN_SECONDS);
  });

  it('scores a member on nothing', () => {
    expect(getBoardWeights(UserArea.Member)).toEqual({});
  });

  it('puts shared staff work on every table at the same price', () => {
    const janitor = getActionWeight(UserArea.Janitor, 'staff_note_create');
    expect(janitor).toBeGreaterThan(0);
    expect(getActionWeight(UserArea.Moderator, 'staff_note_create')).toBe(
      janitor,
    );
    expect(getActionWeight(UserArea.Admin, 'staff_note_create')).toBe(janitor);
  });

  it('scores an action it has never heard of at zero', () => {
    expect(getActionWeight(UserArea.Moderator, 'mascot_create')).toBe(0);
  });
});

describe('getBoardWork', () => {
  it('names the work that puts someone on a board, and leaves staff actions out of it', () => {
    expect(getBoardWork(UserArea.Janitor)).toContain('approved');
    expect(getBoardWork(UserArea.Janitor)).not.toContain('staff_note_create');
    expect(getBoardWork(UserArea.Moderator)).toContain(
      'ticket_update_approved',
    );
    expect(getBoardWork(UserArea.Moderator)).not.toContain(
      'artist_user_linked',
    );
    expect(getBoardWork(UserArea.Member)).toEqual([]);
  });
});

describe('isOnOwnContent', () => {
  it('spots an action whose target is the actor', () => {
    expect(isOnOwnContent(5, { user_id: 5 })).toBe(true);
    expect(isOnOwnContent(5, { user_id: '5' })).toBe(true);
    expect(isOnOwnContent(5, { user_id: 6 })).toBe(false);
    expect(isOnOwnContent(5, { ticket_id: 5 })).toBe(false);
    expect(isOnOwnContent(5, undefined)).toBe(false);
  });
});

describe('getModActionKey', () => {
  it('splits a ticket update by the status it set', () => {
    expect(getModActionKey('ticket_update', { status: 'approved' })).toBe(
      'ticket_update_approved',
    );
    expect(getModActionKey('ticket_update', { status: 'partial' })).toBe(
      'ticket_update_partial',
    );
  });

  it('leaves a legacy ticket update without a status unscored', () => {
    const key = getModActionKey('ticket_update', {});
    expect(getActionWeight(UserArea.Moderator, key)).toBe(0);
  });

  it('keeps every other action as its own key', () => {
    expect(getModActionKey('user_ban', { user_id: 1 })).toBe('user_ban');
  });

  it('maps a split key back to the rows it came from', () => {
    expect(getModActionSources('ticket_update_approved')).toEqual([
      'ticket_update',
    ]);
    expect(getModActionSources('user_ban')).toEqual(['user_ban']);
    expect(getModActionSources('aibur_approved')).toEqual([
      'tag_alias_update',
      'tag_implication_update',
    ]);
  });

  it('reads an alias or implication decision off its status change', () => {
    const approved =
      'changed status from "pending" to "queued", set approver_id to "1"';
    expect(getModActionKey('tag_alias_update', { change_desc: approved })).toBe(
      'aibur_approved',
    );
    expect(
      getModActionKey('tag_implication_update', {
        change_desc: 'changed status from "pending" to "deleted"',
      }),
    ).toBe('aibur_rejected');
    expect(
      getModActionKey('tag_alias_update', {
        change_desc: 'changed status from "active" to "deleted"',
      }),
    ).toBe('aibur_retired');
  });

  it('leaves the importer transitions unscored', () => {
    const key = getModActionKey('tag_alias_update', {
      change_desc: 'changed status from "queued" to "processing"',
    });
    expect(getActionWeight(UserArea.Admin, key)).toBe(0);
  });
});

describe('toScore', () => {
  it('scores one approval as one point, so the number reads like a count', () => {
    expect(toScore(6)).toBe(1);
    expect(toScore(200)).toBe(33);
    expect(toScore(0)).toBe(0);
  });
});

describe('getWindowCoverage', () => {
  const window = new DateRange({
    startDate: new Date('2025-06-01T00:00:00Z'),
    endDate: new Date('2025-06-05T00:00:00Z'),
  });

  it('reads a finished window as whole', () => {
    expect(getWindowCoverage(window, new Date('2025-07-01T00:00:00Z'))).toBe(1);
  });

  it('reads an open window by the share of it that has passed', () => {
    expect(getWindowCoverage(window, new Date('2025-06-02T00:00:00Z'))).toBe(
      0.25,
    );
  });

  it('reads a window that has not started as empty', () => {
    expect(getWindowCoverage(window, new Date('2025-05-01T00:00:00Z'))).toBe(0);
  });
});

describe('getMiddleMean', () => {
  it('averages the middle half of the board and ignores both tails', () => {
    expect(getMiddleMean([1000, 40, 30, 20, 10, 1])).toBe(25);
    expect(getMiddleMean([40, 30, 20, 10])).toBe(25);
    expect(getMiddleMean([])).toBe(0);
  });

  it('does not move when the top or the bottom changes', () => {
    expect(getMiddleMean([1000, 40, 30, 20, 10, 1])).toBe(
      getMiddleMean([50, 40, 30, 20, 10, 9]),
    );
  });

  it('reads a lone member as themselves', () => {
    expect(getMiddleMean([7])).toBe(7);
  });
});

describe('getStanding', () => {
  it('reads a typical member as one hundred', () => {
    expect(getStanding([1000, 40, 30, 20, 10, 1], 25)).toBe(100);
    expect(getStanding([1000, 40, 30, 20, 10, 1], 50)).toBe(200);
    expect(getStanding([1000, 40, 30, 20, 10, 1], 5)).toBe(20);
  });

  it('reads a lone member as one hundred', () => {
    expect(getStanding([7], 7)).toBe(100);
  });
});

describe('getPerformanceScoreGrade', () => {
  it.each([
    [0, PerformanceGrade.F],
    [9.99, PerformanceGrade.F],
    [10, PerformanceGrade.E],
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
    [399.99, PerformanceGrade.S2],
    [400, PerformanceGrade.S3],
    [799.99, PerformanceGrade.S3],
    [800, PerformanceGrade.S4],
    [1599.99, PerformanceGrade.S4],
    [1600, PerformanceGrade.S5],
    [3199.99, PerformanceGrade.S5],
    [3200, PerformanceGrade.S6],
    [100000, PerformanceGrade.S6],
  ])('grades %s percent of the median as %s', (percent, grade) => {
    expect(getPerformanceScoreGrade(percent)).toBe(grade);
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
