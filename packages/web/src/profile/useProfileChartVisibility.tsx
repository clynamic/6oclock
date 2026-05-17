import { useMemo } from 'react';

import { Activity, ActivitySeriesPoint, useActivity } from '../api';
import { useChartValue } from '../utils/charts';
import { refetchQueryOptions } from '../utils/query';

export type UserLike = { id: number; level?: string };

const ACTIVITY_TO_CHART_MAP: Record<
  keyof Omit<ActivitySeriesPoint, 'date'>,
  string[]
> = {
  postCreate: ['postsUploaded'],
  postApprove: ['postsHandled'],
  postDelete: ['postsHandled'],
  postReplacementApprove: ['replacementsHandled'],
  postReplacementCreate: ['replacementsHandled'],
  postReplacementPromote: ['replacementsHandled'],
  postReplacementReject: ['replacementsHandled'],
  ticketCreate: ['ticketsCreated'],
  ticketHandle: ['ticketsHandled', 'ticketTypes'],
};

const computeProfileChartIds = (
  activityData: ActivitySeriesPoint[] | undefined,
  userLevel: string | undefined,
): string[] => {
  if (!activityData || activityData.length === 0) {
    return ['userHead'];
  }

  const activityChartIds = Object.entries(ACTIVITY_TO_CHART_MAP)
    .filter(([activityKey]) =>
      activityData.some(
        (point) =>
          (point[activityKey as keyof Omit<ActivitySeriesPoint, 'date'>] ??
            0) > 0,
      ),
    )
    .flatMap(([, ids]) => ids);

  const hasAnyActivity = Object.keys(activityData[0] || {})
    .filter((key) => key !== 'date')
    .some((key) =>
      activityData.some((point) => {
        const value = point[key as keyof Omit<ActivitySeriesPoint, 'date'>];
        return (value ?? 0) > 0;
      }),
    );

  const isStaff =
    userLevel &&
    ['janitor', 'moderator', 'admin'].includes(userLevel.toLowerCase());

  return Array.from(
    new Set([
      'userHead',
      ...activityChartIds,
      ...(hasAnyActivity ? ['userActivity'] : []),
      ...(hasAnyActivity && isStaff ? ['userPerformance'] : []),
    ]),
  );
};

export const useProfileCharts = (
  user?: UserLike,
): {
  chartIds: string[];
  isLoading: boolean;
  error: unknown;
} => {
  const { range, area } = useChartValue();

  const {
    data: activityData,
    isLoading,
    error,
  } = useActivity(
    {
      ...range,
      userId: user?.id ?? 0,
      area,
      activities: Object.values(Activity),
    },
    refetchQueryOptions({
      enabled: !!user?.id,
    }),
  );

  const chartIds = useMemo(
    () => computeProfileChartIds(activityData, user?.level),
    [activityData, user?.level],
  );

  return {
    chartIds,
    isLoading,
    error,
  };
};
