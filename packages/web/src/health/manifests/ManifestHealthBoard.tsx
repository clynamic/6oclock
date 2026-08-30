import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router';

import { useManifestHealth } from '../../api';
import { LimitedList } from '../../common/LimitedList';
import { QueryHint } from '../../common/QueryHint';
import { ManifestHealthFrame } from './ManifestHealthFrame';

export const ManifestHealthDisplay = () => {
  const { data, isLoading, error } = useManifestHealth({
    query: { refetchInterval: 10000 },
  });

  return (
    <QueryHint
      data={data}
      isLoading={isLoading}
      isEmpty={!data?.length}
      error={error}
      skeleton={
        <LimitedList>
          {Array.from({ length: 4 }).map((_, index) => (
            <ManifestHealthFrame key={index} />
          ))}
        </LimitedList>
      }
    >
      <LimitedList
        indicator={() => (
          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <Button
              size="small"
              endIcon={<ArrowForward />}
              component={Link}
              to="/health/manifests"
            >
              See All
            </Button>
          </Stack>
        )}
      >
        {data?.map((manifest) => (
          <ManifestHealthFrame key={manifest.type} manifest={manifest} />
        ))}
      </LimitedList>
    </QueryHint>
  );
};
