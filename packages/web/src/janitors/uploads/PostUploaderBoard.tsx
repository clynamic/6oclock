import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { usePostUploaderSummary } from '../../api';
import { LimitedList, NoDataHint } from '../../common';
import { refetchQueryOptions, useChartDateRange } from '../../utils';
import { PostUploaderFrame } from './PostUploaderFrame';

export const PostUploaderBoard: React.FC = () => {
  const range = useChartDateRange();

  const { data } = usePostUploaderSummary(
    {
      ...range,
      limit: 10,
    },
    refetchQueryOptions(),
  );

  if (data?.length === 0) return <NoDataHint />;

  return (
    <LimitedList
      indicator={() => (
        <Stack direction="row" justifyContent="flex-end">
          <Button
            size="small"
            endIcon={<ArrowForward />}
            component={Link}
            to="/janitors/uploads"
          >
            See All
          </Button>
        </Stack>
      )}
    >
      {data
        ? data.map((user) => {
            return <PostUploaderFrame key={user.userId} summary={user} />;
          })
        : Array.from({ length: 5 }).map((_, index) => (
            <PostUploaderFrame key={index} />
          ))}
    </LimitedList>
  );
};
