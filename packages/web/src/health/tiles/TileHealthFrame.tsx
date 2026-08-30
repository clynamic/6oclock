import {
  Card,
  CardActionArea,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { Link } from 'react-router';

import { TileHealth } from '../../api';
import { FactList } from '../../common/FactList';
import { SliceStrip } from '../SliceStrip';

export interface TileHealthFrameProps {
  tile?: TileHealth;
  extended?: boolean;
}

export const TileHealthFrame: React.FC<TileHealthFrameProps> = ({
  tile,
  extended = false,
}) => {
  const missing = tile ? tile.expected - tile.actual : 0;

  return (
    <Card sx={{ width: '100%' }}>
      <CardActionArea
        component={Link}
        to={`/health/tiles/${tile?.type ?? ''}`}
        disabled={!tile}
        sx={{ p: 2 }}
      >
        <Stack spacing={1} sx={{ width: '100%' }}>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
          >
            <Typography variant="body1">
              {tile?.type ?? <Skeleton width={140} />}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: missing ? 'warning.main' : 'text.secondary' }}
            >
              {tile ? (
                `${tile.actual.toLocaleString()} of ${tile.expected.toLocaleString()} tiles`
              ) : (
                <Skeleton width={90} />
              )}
            </Typography>
          </Stack>

          <SliceStrip
            slices={tile?.slices}
            height={extended ? 24 : 12}
            label={(slice) =>
              `${format(slice.startDate, 'PP')} to ${format(
                slice.endDate,
                'PP',
              )}: ${Math.round(slice.available)} of ${Math.round(
                slice.available + slice.unavailable,
              )} tiles`
            }
          />

          {extended ? (
            <FactList
              facts={[
                {
                  label: 'Covers',
                  value: tile
                    ? `${format(tile.startDate, 'PP')} to ${format(tile.endDate, 'PP')}`
                    : undefined,
                },
                { label: 'Ranges', value: tile?.ranges.toString() },
                { label: 'Missing', value: missing.toLocaleString() },
              ]}
            />
          ) : null}
        </Stack>
      </CardActionArea>
    </Card>
  );
};
