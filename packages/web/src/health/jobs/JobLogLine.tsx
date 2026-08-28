import { useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';

import { JobLogInfo } from '../../api';
import { renderParts, renderValue } from './message';

export interface JobLogLineProps {
  line: JobLogInfo;
}

const levelColor: Record<string, string> = {
  debug: 'text.disabled',
  info: 'info.light',
  warn: 'warning.main',
  error: 'error.main',
};

/** Written once per process, so worth nothing on the line itself. */
const NOISE = ['pid', 'hostname'];

const flatten = (
  record: Record<string, unknown>,
  prefix = '',
): [string, unknown][] =>
  Object.entries(record)
    .filter(([key]) => !NOISE.includes(key))
    .flatMap(([key, item]) =>
      typeof item === 'object' && item !== null && !Array.isArray(item)
        ? flatten(item as Record<string, unknown>, `${prefix}${key}.`)
        : [[`${prefix}${key}`, item] as [string, unknown]],
    );

export const JobLogLine: React.FC<JobLogLineProps> = ({ line }) => {
  const [open, setOpen] = useState(false);
  const { msg, ...rest } = line.record;
  const parts = renderParts(String(msg ?? ''), line.record);

  return (
    <Stack
      onClick={() => {
        // A drag to select ends in a click, which would fold the line away.
        if (window.getSelection()?.toString()) return;

        setOpen(!open);
      }}
      sx={{
        cursor: 'pointer',
        borderRadius: 0.5,
        px: 1,
        minWidth: 0,
        maxWidth: '100%',
        '&:hover': { backgroundColor: 'action.hover' },
      }}
    >
      <Stack
        direction="row"
        sx={{
          gap: 1.5,
          alignItems: 'baseline',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            fontFamily: 'monospace',
            flexShrink: 0,
          }}
        >
          {`${format(new Date(line.at), 'HH:mm:ss')} `}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: levelColor[line.level] ?? 'text.secondary',
            fontFamily: 'monospace',
            fontWeight: 600,
            width: '5ch',
            flexShrink: 0,
          }}
        >
          {`${line.level.slice(0, 5).toUpperCase()} `}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontFamily: 'monospace',
            minWidth: 0,
            ...(open
              ? { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }
              : {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }),
          }}
        >
          {parts.map((part, index) =>
            part.field ? (
              <Box
                key={index}
                component="span"
                sx={{ color: 'text.primary', fontWeight: 600 }}
              >
                {part.text}
              </Box>
            ) : (
              <Box key={index} component="span">
                {part.text}
              </Box>
            ),
          )}
        </Typography>
      </Stack>
      {open ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            columnGap: 2,
            rowGap: 0.25,
            py: 1,
            pl: '9ch',
          }}
        >
          {flatten({
            ...(line.context ? { context: line.context } : {}),
            ...rest,
          }).map(([key, item]) => (
            <Box key={key} sx={{ display: 'contents' }}>
              <Typography
                variant="caption"
                sx={{ color: 'text.disabled', fontFamily: 'monospace' }}
              >
                {`${key} `}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
              >
                {renderValue(item)}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : null}
    </Stack>
  );
};
