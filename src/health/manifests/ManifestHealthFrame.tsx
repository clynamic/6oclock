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
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';

import {
  ManifestHealth,
  getManifestHealthQueryKey,
  useDeleteManifest,
} from '../../api';

export interface ManifestHealthFrameProps {
  manifest?: ManifestHealth;
  extended?: boolean;
}

export const ManifestHealthFrame: React.FC<ManifestHealthFrameProps> = ({
  manifest,
  extended = false,
}) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteManifest } = useDeleteManifest();
  const missing =
    manifest?.slices.reduce((acc, s) => acc + s.unavailable, 0) ?? 0;

  const handleDelete = async () => {
    if (!manifest) return;
    await deleteManifest({ id: manifest.id });
    queryClient.invalidateQueries({
      queryKey: getManifestHealthQueryKey(),
    });
  };

  return (
    <PopupState
      variant="popover"
      popupId={manifest?.id ? `popup-${manifest.id}` : undefined}
    >
      {function (popupState) {
        return (
          <Card sx={{ width: '100%' }}>
            <Stack p={2} spacing={1} sx={{ width: '100%' }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ width: '100%' }}
              >
                <Typography variant="h6">
                  {manifest ? (
                    `${manifest.type} #${manifest.id}`
                  ) : (
                    <Skeleton width={200} />
                  )}
                </Typography>
                {manifest && (
                  <>
                    <IconButton
                      {...bindTrigger(popupState)}
                      size="small"
                      color="secondary"
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu {...bindMenu(popupState)}>
                      <MenuItem
                        onClick={async () => {
                          await handleDelete();
                          popupState.close();
                        }}
                      >
                        <ListItemIcon>
                          <Delete />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </Stack>
              <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
                {manifest ? (
                  <>
                    <Chip
                      icon={<CalendarMonth />}
                      label={`${format(manifest.startDate, 'PP')} - ${format(manifest.endDate, 'PP')}`}
                    />
                    <Chip
                      icon={<Tag />}
                      label={`${manifest.startId} - ${manifest.endId}`}
                    />
                    <Chip
                      icon={<DataUsage />}
                      label={`${Math.round((manifest.count / (manifest.endId - manifest.startId + 1)) * 10000) / 100}%`}
                    />
                    <Chip
                      icon={<FolderOpen />}
                      label={`${manifest.count} total`}
                    />
                    {missing > 0 && (
                      <Chip
                        icon={<ErrorOutline />}
                        label={`${missing} missing`}
                      />
                    )}
                  </>
                ) : (
                  [...Array(2)].map((_, index) => (
                    <Chip
                      key={index}
                      icon={
                        <Skeleton variant="circular" width={24} height={24} />
                      }
                      label={<Skeleton width={100} />}
                    />
                  ))
                )}
              </Stack>
              <Box sx={{ height: 4 }} />
              <Box sx={{ width: '100%' }}>
                {manifest ? (
                  Array(extended ? Math.ceil(manifest.slices.length / 30) : 1)
                    .fill(0)
                    .map((_, groupIndex) => {
                      const dataset = manifest.slices.slice(
                        groupIndex * 30,
                        extended ? (groupIndex + 1) * 30 : 30,
                      );

                      const chartCount = manifest.slices.length / 30;
                      const height = extended
                        ? chartCount >= 8
                          ? 15
                          : chartCount >= 4
                            ? 30
                            : 60
                        : 60;

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
                    })
                ) : (
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
                )}
              </Box>
            </Stack>
          </Card>
        );
      }}
    </PopupState>
  );
};
