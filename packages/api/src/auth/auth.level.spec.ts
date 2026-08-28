import { UserLevel, getUserLevelFromString } from './auth.level';

describe('UserLevel', () => {
  it('orders the ladder the way e621ng does', () => {
    expect([
      UserLevel.Anonymous,
      UserLevel.Blocked,
      UserLevel.Member,
      UserLevel.Privileged,
      UserLevel.FormerStaff,
      UserLevel.Staff,
      UserLevel.Janitor,
      UserLevel.Moderator,
      UserLevel.Admin,
    ]).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80]);
  });

  it('puts staff below janitor, so a staff gate admits every moderation tier', () => {
    expect(UserLevel.Staff).toBeLessThan(UserLevel.Janitor);
    expect(UserLevel.Janitor).toBeLessThan(UserLevel.Moderator);
    expect(UserLevel.Moderator).toBeLessThan(UserLevel.Admin);
  });

  it('puts former staff below staff, so a staff gate turns them away', () => {
    expect(UserLevel.FormerStaff).toBeLessThan(UserLevel.Staff);
  });
});

describe('getUserLevelFromString', () => {
  it.each([
    ['Anonymous', UserLevel.Anonymous],
    ['Blocked', UserLevel.Blocked],
    ['Member', UserLevel.Member],
    ['Privileged', UserLevel.Privileged],
    ['Former Staff', UserLevel.FormerStaff],
    ['Staff', UserLevel.Staff],
    ['Janitor', UserLevel.Janitor],
    ['Moderator', UserLevel.Moderator],
    ['Admin', UserLevel.Admin],
  ])('reads the display name %s as %s', (name, level) => {
    expect(getUserLevelFromString(name)).toBe(level);
  });

  it.each([
    ['former_staff', UserLevel.FormerStaff],
    ['FORMER STAFF', UserLevel.FormerStaff],
    ['former staff', UserLevel.FormerStaff],
    ['MODERATOR', UserLevel.Moderator],
    ['moderator', UserLevel.Moderator],
  ])('reads %s as %s regardless of case and separator', (name, level) => {
    expect(getUserLevelFromString(name)).toBe(level);
  });

  it('returns undefined for a level name it does not know', () => {
    expect(getUserLevelFromString('Wizard')).toBeUndefined();
  });

  it('returns undefined for an absent or empty level', () => {
    expect(getUserLevelFromString(undefined)).toBeUndefined();
    expect(getUserLevelFromString('')).toBeUndefined();
  });
});

describe('the level a gate compares against', () => {
  const passes = (level: string, required: UserLevel): boolean => {
    const parsed = getUserLevelFromString(level);
    return !(parsed === undefined || parsed < required);
  };

  it('admits every moderation tier through a staff gate', () => {
    expect(passes('Staff', UserLevel.Staff)).toBe(true);
    expect(passes('Janitor', UserLevel.Staff)).toBe(true);
    expect(passes('Moderator', UserLevel.Staff)).toBe(true);
    expect(passes('Admin', UserLevel.Staff)).toBe(true);
  });

  it('turns members and former staff away from a staff gate', () => {
    expect(passes('Member', UserLevel.Staff)).toBe(false);
    expect(passes('Privileged', UserLevel.Staff)).toBe(false);
    expect(passes('Former Staff', UserLevel.Staff)).toBe(false);
  });

  it('turns an unreadable level away from every gate', () => {
    expect(passes('Wizard', UserLevel.Staff)).toBe(false);
    expect(passes('', UserLevel.Staff)).toBe(false);
    expect(passes('999', UserLevel.Staff)).toBe(false);
  });

  it('turns a numeric level string away rather than reading it as a rank', () => {
    expect(getUserLevelFromString('0')).toBeUndefined();
    expect(getUserLevelFromString('20')).toBeUndefined();
    expect(getUserLevelFromString('80')).toBeUndefined();
    expect(passes('0', UserLevel.Admin)).toBe(false);
    expect(passes('80', UserLevel.Admin)).toBe(false);
  });
});
