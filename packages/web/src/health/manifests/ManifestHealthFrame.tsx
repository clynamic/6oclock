import {
  Card,
  CardActionArea,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router';

import { ManifestHealth } from '../../api';
import { FactList } from '../../common/FactList';
import { SliceStrip } from '../SliceStrip';
import { sliceState } from '../slice';

export interface ManifestHealthFrameProps {
  manifest?: ManifestHealth;
  extended?: boolean;
}

export const ManifestHealthFrame: React.FC<ManifestHealthFrameProps> = ({
  manifest,
  extended = false,
}) => {
  const whole = manifest && manifest.covered >= manifest.reach - 1;

  return (
    <Card sx={{ width: '100%' }}>
      <CardActionArea
        component={Link}
        to={`/health/manifests/${manifest?.type ?? ''}`}
        disabled={!manifest}
        sx={{ p: 2 }}
      >
        <Stack spacing={1} sx={{ width: '100%' }}>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
          >
            <Typography variant="body1">
              {manifest?.type ?? <Skeleton width={140} />}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: whole ? 'text.secondary' : 'warning.main' }}
            >
              {manifest ? (
                `${Math.round(manifest.covered)} of ${Math.round(manifest.reach)} days`
              ) : (
                <Skeleton width={80} />
              )}
            </Typography>
          </Stack>

          <SliceStrip
            slices={manifest?.slices}
            porous={manifest?.porous}
            height={extended ? 24 : 12}
            label={(slice) =>
              manifest
                ? `${format(slice.startDate, 'PP')} to ${format(
                    slice.endDate,
                    'PP',
                  )}: ${sliceState(slice)}`
                : ''
            }
          />

          {extended ? (
            <FactList
              facts={[
                {
                  label: 'Covers',
                  value: manifest
                    ? `${format(manifest.startDate, 'PP')} to ${format(manifest.endDate, 'PP')}`
                    : undefined,
                },
                { label: 'Parts', value: manifest?.parts.toString() },
                { label: 'Gaps', value: manifest?.gaps.toString() },
                {
                  label: 'Synced',
                  value: manifest
                    ? formatDistanceToNow(manifest.updatedAt, {
                        addSuffix: true,
                      })
                    : undefined,
                },
              ]}
            />
          ) : null}
        </Stack>
      </CardActionArea>
    </Card>
  );
};
