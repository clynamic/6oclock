import {
  CalendarMonth,
  DataUsage,
  Delete,
  ErrorOutline,
  FolderOpen,
  MoreVert,
  Tag,
} from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';

import { useDeleteManifest, useManifestHealth } from '../../api';
import { QueryHint } from '../../common';

export const ManifestHealthDisplay: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading, error, refetch } = useManifestHealth({
    query: {
      refetchInterval: 10000,
    },
  });
  const { mutateAsync: deleteManifest } = useDeleteManifest();

  return (
    <QueryHint
      isLoading={isLoading}
      error={error}
      skeleton={[...Array(3)].map((_, index) => (
        <Card key={index} sx={{ width: '100%' }}>
          <Stack p={2} spacing={1} sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6">
                <Skeleton width={200} />
              </Typography>
            </Stack>
            <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
              {[...Array(2)].map((_, index) => (
                <Chip
                  key={index}
                  icon={<Skeleton variant="circular" width={24} height={24} />}
                  label={<Skeleton width={100} />}
                />
              ))}
            </Stack>
            <Box sx={{ height: 4 }} />
            <Stack direction="row" justifyContent="space-between">
              {[...Array(30)].map((_, index) => (
                <Skeleton
                  variant="rectangular"
                  key={index}
                  height={60}
                  width={10}
                />
              ))}
            </Stack>
          </Stack>
        </Card>
      ))}
    >
      {data?.map((heart) => (
        <PopupState
          key={heart.id}
          variant="popover"
          popupId={`popup-${heart.id}`}
        >
          {function (popupState) {
            const missing = heart.slices.reduce(
              (acc, s) => acc + s.unavailable,
              0,
            );

            return (
              <Card key={heart.id} sx={{ width: '100%' }}>
                <Stack p={2} spacing={1} sx={{ width: '100%' }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ width: '100%' }}
                  >
                    <Typography variant="h6">
                      {`${heart.type} #${heart.id}`}
                    </Typography>
                    <IconButton
                      {...bindTrigger(popupState)}
                      size="small"
                      color="secondary"
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu {...bindMenu(popupState)}>
                      <MenuItem
                        onClick={() => {
                          deleteManifest({ id: heart.id });
                          refetch();
                          popupState.close();
                        }}
                      >
                        <ListItemIcon>
                          <Delete />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                      </MenuItem>
                    </Menu>
                  </Stack>
                  <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
                    <Chip
                      icon={<CalendarMonth />}
                      label={`${DateTime.fromJSDate(heart.startDate).toLocaleString()} - ${DateTime.fromJSDate(heart.endDate).toLocaleString()}`}
                    />
                    <Chip
                      icon={<Tag />}
                      label={`${heart.startId} - ${heart.endId}`}
                    />
                    <Chip
                      icon={<DataUsage />}
                      label={`${Math.round((heart.count / (heart.endId - heart.startId + 1)) * 10000) / 100}%`}
                    />
                    <Chip
                      icon={<FolderOpen />}
                      label={`${heart.count} total`}
                    />
                    {missing > 0 && (
                      <Chip
                        icon={<ErrorOutline />}
                        label={`${missing} missing`}
                      />
                    )}
                  </Stack>
                  <Box sx={{ height: 4 }} />
                  <Box sx={{ width: '100%' }}>
                    {Array(Math.ceil(heart.slices.length / 30))
                      .fill(0)
                      .map((_, groupIndex) => {
                        const dataset = heart.slices.slice(
                          groupIndex * 30,
                          (groupIndex + 1) * 30,
                        );

                        const chartCount = heart.slices.length / 30;
                        const height =
                          chartCount >= 8 ? 15 : chartCount >= 4 ? 30 : 60;

                        return (
                          <Box
                            key={groupIndex}
                            sx={{
                              width: '100%',
                              height: height,
                              marginBottom: 2,
                            }}
                          >
                            <BarChart
                              dataset={dataset.map((d) => ({ ...d }))}
                              xAxis={[
                                {
                                  scaleType: 'band',
                                  dataKey: 'startId',
                                  valueFormatter: (v: number) => `#${v}`,
                                  colorMap: {
                                    type: 'piecewise',
                                    thresholds: dataset
                                      .slice(1)
                                      .map((d) => d.startId),
                                    colors: dataset.map((d) => {
                                      if (
                                        d.available === 0 &&
                                        d.unavailable === 0
                                      ) {
                                        return theme.palette.grey[400];
                                      } else if (d.unavailable === 0) {
                                        return theme.palette.success.main;
                                      } else if (d.available === 0) {
                                        return theme.palette.error.main;
                                      } else {
                                        const total =
                                          d.available +
                                          d.unavailable +
                                          (d.none || 0);
                                        const ratio = d.unavailable / total;
                                        return ratio > 0.1
                                          ? theme.palette.error.main
                                          : theme.palette.warning.main;
                                      }
                                    }),
                                  },
                                },
                              ]}
                              yAxis={[
                                {
                                  domainLimit: 'strict',
                                },
                              ]}
                              margin={{
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                              }}
                              series={[
                                {
                                  dataKey: 'available',
                                  stack: 'span',
                                  color: theme.palette.success.main,
                                  label: 'Available',
                                },
                                {
                                  dataKey: 'unavailable',
                                  stack: 'span',
                                  color: theme.palette.error.main,
                                  label: 'Missing',
                                },
                                {
                                  dataKey: 'none',
                                  stack: 'span',
                                  color: theme.palette.grey[400],
                                  label: 'None',
                                },
                              ]}
                              slotProps={{
                                legend: { hidden: true },
                                noDataOverlay: { message: 'No data available' },
                              }}
                              leftAxis={null}
                              bottomAxis={null}
                            />
                          </Box>
                        );
                      })}
                  </Box>
                </Stack>
              </Card>
            );
          }}
        </PopupState>
      ))}
    </QueryHint>
  );
};
