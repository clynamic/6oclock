// Values match e621ng UserLevel::MAPPING, one of which user sync sends upstream as search[min_level].
export enum UserLevel {
  Anonymous = 0,
  Blocked = 10,
  Member = 20,
  Privileged = 30,
  FormerStaff = 40,
  Staff = 50,
  Janitor = 60,
  Moderator = 70,
  Admin = 80,
}

export function getUserLevelFromString(level?: string): UserLevel | undefined {
  if (!level) return undefined;
  const normalizedLevel = level
    .split(/[\s_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
  const value = UserLevel[normalizedLevel as keyof typeof UserLevel];
  return typeof value === 'number' ? value : undefined;
}
