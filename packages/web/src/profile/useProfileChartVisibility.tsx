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

  const chartIds = useMemo<string[]>(() => {
    const chartIds = new Set<string>(['userHead']);

    if (!activityData || activityData.length === 0) {
      return Array.from(chartIds);
    }

    Object.entries(ACTIVITY_TO_CHART_MAP).forEach(
      ([activityKey, chartIdList]) => {
        const hasActivity = activityData.some(
          (point) =>
            (point[activityKey as keyof Omit<ActivitySeriesPoint, 'date'>] ??
              0) > 0,
        );

        if (hasActivity) {
          chartIdList.forEach((chartId) => chartIds.add(chartId));
        }
      },
    );

    const hasAnyActivity = Object.keys(activityData[0] || {})
      .filter((key) => key !== 'date')
      .some((key) =>
        activityData.some((point) => {
          const value = point[key as keyof Omit<ActivitySeriesPoint, 'date'>];
          return (value ?? 0) > 0;
        }),
      );

    const isStaff =
      user?.level &&
      ['janitor', 'moderator', 'admin'].includes(user.level.toLowerCase());

    if (hasAnyActivity) {
      chartIds.add('userActivity');
      if (isStaff) {
        chartIds.add('userPerformance');
      }
    }

    return Array.from(chartIds);
  }, [activityData, user?.level]);

  return {
    chartIds,
    isLoading,
    error,
  };
};
