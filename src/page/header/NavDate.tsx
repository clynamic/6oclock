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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isAfter, isBefore } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCurrentUserHead } from '../../auth/user';
import {
  addPeriods,
  formatRangeLabel,
  inferDurationFromRange,
  startOfPeriod,
  TimeDuration,
  unitFromDuration,
} from '../../utils/ranges';
import { SHIP_TIMEZONE } from '../../utils/timezone';
import { useChartContext } from '../../utils/charts';
import { NavButton } from './NavButton';
import { usePageHeaderContext } from './PageHeaderContext';
import { TZDate } from '@date-fns/tz';

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
  const { data: enabled } = useCurrentUserHead();
  const {
    params: {
      range: { startDate, endDate, timezone },
    },
    setParams,
    resetParams,
  } = useChartContext();
  const chartDuration = useMemo(
    () => inferDurationFromRange(startDate, endDate),
    [startDate, endDate],
  );
  const { layout } = usePageHeaderContext();
  const isWideLayout = useMemo(() => layout === 'wide', [layout]);

  const now = new TZDate(new Date(), SHIP_TIMEZONE);

  const [currentDuration, setCurrentDuration] = useState(chartDuration);
  const durationUnit = useMemo(
    () => unitFromDuration(currentDuration),
    [currentDuration],
  );

  const [currentDate, setCurrentDate] = useState(startDate);

  const [view, setView] = useState<CalendarView>('day');

  const calendarViews = useMemo(
    () => getCalendarViews(currentDuration),
    [currentDuration],
  );

  const rangeStart = useMemo(
    () => startOfPeriod(currentDate, durationUnit),
    [currentDate, durationUnit],
  );
  const rangeEnd = useMemo(
    () => addPeriods(rangeStart, durationUnit, 1),
    [rangeStart, durationUnit],
  );

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorEl);

  useEffect(() => {
    setView(calendarViews.at(-1)!);
  }, [calendarViews]);

  const resetCurrentState = useCallback(() => {
    setCurrentDate(startDate);
    setCurrentDuration(chartDuration);
  }, [startDate, chartDuration]);

  useEffect(() => {
    setCurrentDate(startDate);
    setCurrentDuration(chartDuration);
  }, [startDate, endDate, chartDuration]);

  const isInRange = useCallback(
    (date: Date) => !isBefore(date, rangeStart) && isBefore(date, rangeEnd),
    [rangeStart, rangeEnd],
  );

  const shiftRange = useCallback(
    (dir: 'back' | 'forward') => {
      const factor = dir === 'back' ? -1 : 1;
      const newStart = addPeriods(rangeStart, durationUnit, factor);
      setParams((previous) => ({
        ...previous,
        range: {
          startDate: newStart,
          endDate: addPeriods(newStart, durationUnit, 1),
          timezone,
        },
      }));
    },
    [setParams, rangeStart, durationUnit, timezone],
  );

  const applySelection = useCallback(
    (date: Date, duration: TimeDuration) => {
      const newStart = startOfPeriod(date, unitFromDuration(duration));
      const newEnd = addPeriods(newStart, duration, 1);
      setParams((previous) => ({
        ...previous,
        range: {
          startDate: newStart,
          endDate: newEnd,
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
      <DatePageButtons
        isWideLayout={isWideLayout}
        shiftRange={shiftRange}
        disabled={!enabled}
      >
        <NavButton
          onClick={(e) => {
            e.preventDefault();
            setAnchorEl(e.currentTarget);
          }}
          style={{
            height: '100%',
          }}
          disabled={!enabled}
        >
          {formatRangeLabel(startDate, endDate, chartDuration)}
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

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar
              value={currentDate}
              onChange={(date) => setCurrentDate(date as Date)}
              view={view}
              views={calendarViews}
              onViewChange={setView}
              // "disableFuture" does not work, because it uses the local timezone.
              shouldDisableDate={(date) => isAfter(date, now)}
              shouldDisableMonth={(month) => isAfter(month, now)}
              shouldDisableYear={(year) => isAfter(year, now)}
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
  disabled?: boolean;
};

const DatePageButtons = ({
  isWideLayout,
  shiftRange,
  children,
  disabled = false,
}: DatePageButtonsProps) => {
  if (!isWideLayout) return <>{children}</>;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <IconButton
        size="small"
        style={{ padding: 4 }}
        onClick={() => shiftRange('back')}
        disabled={disabled}
      >
        <ChevronLeft />
      </IconButton>
      {children}
      <IconButton
        size="small"
        style={{ padding: 4 }}
        onClick={() => shiftRange('forward')}
        disabled={disabled}
      >
        <ChevronRight />
      </IconButton>
    </Stack>
  );
};
