import {
  CalendarMonth,
  DataUsage,
  Delete,
  MoreVert,
  Storage,
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
  TileHealth,
  getTileHealthQueryKey,
  useDeleteTilesByType,
} from '../../api';

export interface TileHealthFrameProps {
  tile?: TileHealth;
  extended?: boolean;
}

export const TileHealthFrame: React.FC<TileHealthFrameProps> = ({
  tile,
  extended = false,
}) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteTiles } = useDeleteTilesByType();

  const handleDelete = async () => {
    if (!tile) return;
    await deleteTiles({ type: tile.type });
    queryClient.invalidateQueries({
      queryKey: getTileHealthQueryKey(),
    });
  };

  return (
    <PopupState
      variant="popover"
      popupId={tile?.type ? `popup-${tile.type}` : undefined}
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
                  {tile ? tile.type : <Skeleton width={200} />}
                </Typography>
                {tile && (
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
                {tile ? (
                  <>
                    <Chip
                      icon={<CalendarMonth />}
                      label={`${format(tile.startDate, 'PP')} - ${format(tile.endDate, 'PP')}`}
                    />
                    <Chip
                      icon={<DataUsage />}
                      label={`${Math.round((tile.actual / tile.expected) * 100)}%`}
                    />
                    <Chip
                      icon={<Storage />}
                      label={`${tile.actual} / ${tile.expected} tiles`}
                    />
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
                {tile ? (
                  Array(extended ? Math.ceil(tile.slices.length / 30) : 1)
                    .fill(0)
                    .map((_, groupIndex) => {
                      const dataset = tile.slices.slice(
                        groupIndex * 30,
                        extended ? (groupIndex + 1) * 30 : 30,
                      );

                      const chartCount = tile.slices.length / 30;
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
                                dataKey: 'startDate',
                                valueFormatter: (v: Date) => format(v, 'MMM d'),
                                position: 'none',
                                colorMap: {
                                  type: 'piecewise',
                                  thresholds: dataset
                                    .slice(1)
                                    .map((d) => d.startDate),
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
                                position: 'none',
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
                            hideLegend={true}
                            slotProps={{
                              noDataOverlay: { message: 'No data available' },
                            }}
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
