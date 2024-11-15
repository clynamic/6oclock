import { ZoomOutMap } from '@mui/icons-material';
import { Box, Card, CardProps, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

import ErrorBoundary from '../common/ErrorBoundary';
import { createDashboardChild } from './DashboardChild';
import { useDashboard } from './DashboardContext';

export type DashboardCardProps = Pick<CardProps, 'variant'> & {
  children: ReactNode;
  title?: ReactNode;
};

export const DashboardCard = createDashboardChild<DashboardCardProps>(
  ({ children, title, variant }) => {
    const { isEditing } = useDashboard();

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
