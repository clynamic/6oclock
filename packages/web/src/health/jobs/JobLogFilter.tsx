import { useState } from 'react';

import {
  BugReportOutlined,
  Close,
  ErrorOutlined,
  FilterList,
  InfoOutlined,
  Restore,
  WarningAmberOutlined,
} from '@mui/icons-material';
import {
  Button,
  IconButton,
  Popover,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

const LEVEL_ORDER = ['debug', 'info', 'warn', 'error'];

const LEVEL_ICON: Record<string, React.ReactElement> = {
  debug: <BugReportOutlined fontSize="small" />,
  info: <InfoOutlined fontSize="small" />,
  warn: <WarningAmberOutlined fontSize="small" />,
  error: <ErrorOutlined fontSize="small" />,
};

const summarise = (shown: string[]): string => {
  if (shown.length === LEVEL_ORDER.length) return 'All levels';
  if (shown.length === 0) return 'No levels';
  if (shown.length === 1) return shown[0]!;

  const marks = shown.map((level) => LEVEL_ORDER.indexOf(level));
  const gaps = marks.some(
    (mark, index) => index > 0 && mark !== marks[index - 1]! + 1,
  );

  if (gaps) return shown.join(', ');

  const first = marks[0]!;
  const last = marks[marks.length - 1]!;

  if (last === LEVEL_ORDER.length - 1) return `${LEVEL_ORDER[first]} and above`;
  if (first === 0) return `${LEVEL_ORDER[last]} and below`;

  return `${LEVEL_ORDER[first]} to ${LEVEL_ORDER[last]}`;
};

export interface JobLogFilterProps {
  hidden: string[];
  onChange: (hidden: string[]) => void;
}

export const JobLogFilter: React.FC<JobLogFilterProps> = ({
  hidden,
  onChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const shown = LEVEL_ORDER.filter((level) => !hidden.includes(level));
  const all = shown.length === LEVEL_ORDER.length;

  return (
    <>
      <Button
        size="small"
        variant="text"
        color="inherit"
        startIcon={<FilterList />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ minWidth: 0, textTransform: 'none' }}
      >
        <Typography variant="button" noWrap sx={{ textTransform: 'none' }}>
          {summarise(shown)}
        </Typography>
      </Button>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { maxWidth: 'calc(100vw - 16px)' } } }}
      >
        <Stack spacing={2} sx={{ p: 2, minWidth: { xs: 0, sm: 360 } }}>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="h6">Filter levels</Typography>
            <IconButton onClick={() => setAnchorEl(null)}>
              <Close />
            </IconButton>
          </Stack>

          <ToggleButtonGroup
            fullWidth
            size="small"
            color="primary"
            value={shown}
            onChange={(_, next: string[]) =>
              onChange(LEVEL_ORDER.filter((level) => !next.includes(level)))
            }
          >
            {LEVEL_ORDER.map((level) => (
              <ToggleButton key={level} value={level} sx={{ px: 1 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  sx={{ gap: 0.5, alignItems: 'center' }}
                >
                  {LEVEL_ICON[level]}
                  {level}
                </Stack>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <Button
              variant="text"
              color="secondary"
              startIcon={<Restore />}
              onClick={() => onChange([])}
              disabled={all}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
};
