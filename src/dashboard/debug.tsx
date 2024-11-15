import { DashboardPosition, DashboardUpdate } from '../api';

export const extractDashboardLayoutPositions = (
  update: DashboardUpdate,
): Record<string, Record<string, Omit<DashboardPosition, 'i'>>> => {
  if (!update.positions) return {};

  const extracted: Record<
    string,
    Record<string, Omit<DashboardPosition, 'i'>>
  > = {};

  for (const [breakpoint, positions] of Object.entries(update.positions)) {
    if (Array.isArray(positions)) {
      positions.forEach(({ x, y, w, h, i }) => {
        if (!extracted[i]) {
          extracted[i] = {};
        }
        extracted[i][breakpoint] = { x, y, w, h };
      });
    }
  }

  return extracted;
};
