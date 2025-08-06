import { useEffect, useState } from 'react';

import { TZDate } from '@date-fns/tz';
import { Sailing } from '@mui/icons-material';
import { Popover, Stack, Typography, useTheme } from '@mui/material';
import { format } from 'date-fns';

import { SHIP_TIMEZONE } from '../../utils/timezone';
import { NavButton } from './NavButton';

const MiniClockIcon: React.FC<{ time: Date }> = ({ time }) => {
  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();

  const hourAngle = hours * 30 + minutes * 0.5 - 90;
  const minuteAngle = minutes * 6 - 90;

  const size = 16;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* Clock face circle */}
      <circle
        cx={center}
        cy={center}
        r={center - 1}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Hour hand */}
      <line
        x1={center}
        y1={center}
        x2={center + (center - 5) * Math.cos((hourAngle * Math.PI) / 180)}
        y2={center + (center - 5) * Math.sin((hourAngle * Math.PI) / 180)}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        x1={center}
        y1={center}
        x2={center + (center - 2) * Math.cos((minuteAngle * Math.PI) / 180)}
        y2={center + (center - 2) * Math.sin((minuteAngle * Math.PI) / 180)}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

const ClockFace: React.FC<{ time: Date }> = ({ time }) => {
  const theme = useTheme();
  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourAngle = hours * 30 + minutes * 0.5 - 90;
  const minuteAngle = minutes * 6 - 90;
  const secondAngle = seconds * 6 - 90;

  const size = 120;
  const center = size / 2;

  return (
    <svg width={size} height={size}>
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={center - 2}
        fill={theme.palette.background.paper}
        strokeOpacity="0.1"
        strokeWidth="1"
      />

      {/* Hour marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = i * 30 - 90;
        const x1 = center + (center - 10) * Math.cos((angle * Math.PI) / 180);
        const y1 = center + (center - 10) * Math.sin((angle * Math.PI) / 180);
        const x2 = center + (center - 5) * Math.cos((angle * Math.PI) / 180);
        const y2 = center + (center - 5) * Math.sin((angle * Math.PI) / 180);

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.6"
          />
        );
      })}

      {/* Hour hand */}
      <line
        x1={center}
        y1={center}
        x2={center + (center - 25) * Math.cos((hourAngle * Math.PI) / 180)}
        y2={center + (center - 25) * Math.sin((hourAngle * Math.PI) / 180)}
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        x1={center}
        y1={center}
        x2={center + (center - 15) * Math.cos((minuteAngle * Math.PI) / 180)}
        y2={center + (center - 15) * Math.sin((minuteAngle * Math.PI) / 180)}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Second hand */}
      <line
        x1={center}
        y1={center}
        x2={center + (center - 12) * Math.cos((secondAngle * Math.PI) / 180)}
        y2={center + (center - 12) * Math.sin((secondAngle * Math.PI) / 180)}
        stroke="red"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx={center} cy={center} r="4" fill="currentColor" />
    </svg>
  );
};

export const NavClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(
    () => new TZDate(new Date(), SHIP_TIMEZONE),
  );
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorEl);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new TZDate(new Date(), SHIP_TIMEZONE));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <NavButton
        onClick={handleClick}
        startIcon={<MiniClockIcon time={currentTime} />}
        sx={{
          fontFamily: 'monospace',
          px: 1.5,
          py: 0.5,
        }}
      >
        {format(currentTime, 'HH:mm')}
      </NavButton>

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Stack spacing={3} p={3} minWidth={240} alignItems="center">
          <ClockFace time={currentTime} />

          <Stack alignItems="center" spacing={1}>
            <Typography
              variant="h4"
              sx={{ fontFamily: 'monospace', marginBottom: 0 }}
            >
              {format(currentTime, 'HH:mm:ss')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(currentTime, 'EEEE, MMMM do, yyyy')}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Sailing sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Ship Time
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
};
