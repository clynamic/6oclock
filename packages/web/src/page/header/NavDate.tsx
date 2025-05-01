import {
  Check,
  ChevronLeft,
  ChevronRight,
  Close,
  Restore,
} from '@mui/icons-material';
import {
  alpha,
  Button,
  IconButton,
  Popover,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import {
  DateCalendar,
  LocalizationProvider,
  PickersDay,
} from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  formatRangeLabel,
  inferDurationFromRange,
  TimeDuration,
  unitFromDuration,
  useChartContext,
} from '../../utils';
import { NavButton } from './NavButton';
import { usePageHeaderContext } from './PageHeaderContext';

type CalendarView = 'year' | 'month' | 'day';

const getCalendarViews = (d: TimeDuration): CalendarView[] => {
  switch (d) {
    case TimeDuration.Year:
      return ['year'];
    case TimeDuration.Month:
      return ['year', 'month'];
    default:
      return ['year', 'month', 'day'];
  }
};

export const NavDate: React.FC = () => {
  const theme = useTheme();
  const {
    params: {
      range: { startDate, endDate, timezone },
    },
    setParams,
    resetParams,
  } = useChartContext();
  const chartDuration = useMemo(
    () =>
      inferDurationFromRange(
        DateTime.fromJSDate(startDate),
        DateTime.fromJSDate(endDate),
      ),
    [startDate, endDate],
  );
  const { layout } = usePageHeaderContext();
  const isWideLayout = useMemo(() => layout === 'wide', [layout]);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentDate, setCurrentDate] = useState(() =>
    DateTime.fromJSDate(startDate),
  );
  const [currentDuration, setCurrentDuration] = useState(() => chartDuration);
  const [view, setView] = useState<CalendarView>('day');

  const isOpen = Boolean(anchorEl);

  const durationUnit = useMemo(
    () => unitFromDuration(currentDuration),
    [currentDuration],
  );
  const calendarViews = useMemo(
    () => getCalendarViews(currentDuration),
    [currentDuration],
  );

  const rangeStart = useMemo(
    () => currentDate.startOf(durationUnit),
    [currentDate, durationUnit],
  );
  const rangeEnd = useMemo(
    () => rangeStart.plus({ [durationUnit]: 1 }),
    [rangeStart, durationUnit],
  );

  useEffect(() => {
    setView(calendarViews.at(-1)!);
  }, [calendarViews]);

  const resetCurrentState = useCallback(() => {
    setCurrentDate(DateTime.fromJSDate(startDate));
    setCurrentDuration(chartDuration);
  }, [startDate, chartDuration]);

  useEffect(() => {
    setCurrentDate(DateTime.fromJSDate(startDate));
    setCurrentDuration(chartDuration);
  }, [startDate, endDate, chartDuration]);

  const isInRange = useCallback(
    (date: DateTime) => date >= rangeStart && date < rangeEnd,
    [rangeStart, rangeEnd],
  );

  const shiftRange = (dir: 'back' | 'forward') => {
    const factor = dir === 'back' ? -1 : 1;
    const newStart = rangeStart.plus({ [durationUnit]: factor });
    setParams((previous) => ({
      ...previous,
      range: {
        startDate: newStart.toJSDate(),
        endDate: newStart.plus({ [durationUnit]: 1 }).toJSDate(),
        timezone,
      },
    }));
  };

  const applySelection = useCallback(
    (date: DateTime, duration: TimeDuration) => {
      const newStart = date.startOf(unitFromDuration(duration));
      const newEnd = newStart.plus({ [duration.toLowerCase()]: 1 });
      setParams((previous) => ({
        ...previous,
        range: {
          startDate: newStart.toJSDate(),
          endDate: newEnd.toJSDate(),
          timezone,
        },
      }));
      setAnchorEl(null);
    },
    [setParams, timezone],
  );

  const resetToDefaultRange = useCallback(() => {
    resetParams();
    setAnchorEl(null);
  }, [resetParams]);

  return (
    <>
      <DatePageButtons isWideLayout={isWideLayout} shiftRange={shiftRange}>
        <NavButton
          onClick={(e) => {
            e.preventDefault();
            setAnchorEl(e.currentTarget);
          }}
          style={{
            height: '100%',
          }}
        >
          {formatRangeLabel(
            DateTime.fromJSDate(startDate),
            DateTime.fromJSDate(endDate),
            chartDuration,
          )}
        </NavButton>
      </DatePageButtons>

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={() => applySelection(currentDate, currentDuration)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Stack spacing={2} p={2} minWidth={300}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Select Date Range</Typography>
            <IconButton
              onClick={() => {
                resetCurrentState();
                setAnchorEl(null);
              }}
            >
              <Close />
            </IconButton>
          </Stack>

          <ToggleButtonGroup
            fullWidth
            value={currentDuration}
            exclusive
            onChange={(_, newValue) => {
              if (newValue) {
                setCurrentDuration(newValue);
              }
            }}
          >
            {Object.values(TimeDuration).map((key) => (
              <ToggleButton key={key} value={key}>
                {key}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <DateCalendar
              value={currentDate}
              onChange={(date) => setCurrentDate(date as DateTime)}
              view={view}
              views={calendarViews}
              onViewChange={setView}
              disableFuture
              slots={{
                day: (props) => (
                  <PickersDay
                    {...props}
                    style={
                      isInRange(props.day) && !props.selected
                        ? {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.5,
                            ),
                          }
                        : {}
                    }
                  />
                ),
              }}
            />
          </LocalizationProvider>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="text"
              onClick={resetToDefaultRange}
              startIcon={<Restore />}
            >
              Reset
            </Button>
            <Button
              variant="text"
              onClick={() => applySelection(currentDate, currentDuration)}
              startIcon={<Check />}
            >
              Apply
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
};

type DatePageButtonsProps = {
  isWideLayout: boolean;
  shiftRange: (direction: 'back' | 'forward') => void;
  children: React.ReactNode;
};

const DatePageButtons = ({
  isWideLayout,
  shiftRange,
  children,
}: DatePageButtonsProps) => {
  if (!isWideLayout) return <>{children}</>;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <IconButton onClick={() => shiftRange('back')}>
        <ChevronLeft />
      </IconButton>
      {children}
      <IconButton onClick={() => shiftRange('forward')}>
        <ChevronRight />
      </IconButton>
    </Stack>
  );
};
