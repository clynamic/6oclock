import { ZoomOutMap } from '@mui/icons-material';
import { Box, Card, CardProps, Chip, Stack, Typography } from '@mui/material';
import { ReactNode, useMemo } from 'react';

import ErrorBoundary from '../common/ErrorBoundary';
import { ItemType } from '../api';
import { createDashboardChild } from './DashboardChild';
import { useDashboard } from './DashboardContext';

export type DashboardCardProps = Pick<CardProps, 'variant'> & {
  children: ReactNode;
  title?: ReactNode;
  items?: ItemType[];
};

export const DashboardCard = createDashboardChild<DashboardCardProps>(
  ({ children, title, variant, items }) => {
    const { isEditing, available } = useDashboard();

    const availabilityChip = useMemo(() => {
      if (!available || !items?.length) return null;

      const percentages = items
        .map((itemType) => {
          const camelCaseKey = itemType.replace(/_([a-z])/g, (_, letter) =>
            letter.toUpperCase(),
          ) as keyof typeof available;
          return available[camelCaseKey];
        })
        .filter((p): p is number => p !== undefined);

      if (percentages.length === 0) return null;

      const avgPercentage =
        percentages.reduce((sum, p) => sum + p, 0) / percentages.length;

      if (avgPercentage >= 0.95) return null;

      const displayPercentage = Math.round(avgPercentage * 100);
      const color =
        avgPercentage < 0.2
          ? 'error'
          : avgPercentage < 0.5
            ? 'warning'
            : 'default';

      return (
        <Chip label={`${displayPercentage}%`} size="small" color={color} />
      );
    }, [available, items]);

    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
        }}
      >
        <Card
          variant={variant}
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: variant === 'outlined' ? 'transparent' : undefined,
            position: 'relative',

            userSelect: isEditing ? 'none' : undefined,
          }}
        >
          <Stack
            p={2}
            spacing={1}
            sx={{
              height: '100%',
              width: '100%',

              '& > *:not(.react-resizable-handle)': {
                transition: 'opacity 0.2s',
                opacity: isEditing ? 0.5 : 1,
              },
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              sx={{
                flexShrink: 0,
              }}
            >
              <Typography variant="h6">{title}</Typography>
              {availabilityChip && (
                <Stack direction="row" spacing={0.5}>
                  {availabilityChip}
                </Stack>
              )}
            </Stack>
            <ErrorBoundary>{children}</ErrorBoundary>
          </Stack>

          {isEditing && (
            <Box
              className="react-draggable-handle"
              sx={{
                top: 12,
                left: 12,
                right: 12,
                bottom: 12,
                position: 'absolute',
                zIndex: 500,

                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 1,
                cursor: 'grab',

                transition: 'opacity 0.2s',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ZoomOutMap
                  sx={{
                    rotate: '135deg',
                  }}
                />
              </Box>
            </Box>
          )}
        </Card>
      </Box>
    );
  },
);
