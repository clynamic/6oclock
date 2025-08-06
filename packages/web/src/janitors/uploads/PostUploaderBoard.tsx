import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { usePostUploaderSummary } from '../../api';
import { LimitedList } from '../../common/LimitedList';
import { QueryHint } from '../../common/QueryHint';
import { useChartRange } from '../../utils/charts';
import { refetchQueryOptions } from '../../utils/query';
import { PostUploaderFrame } from './PostUploaderFrame';

export const PostUploaderBoard: React.FC = () => {
  const range = useChartRange();

  const { data, isLoading, error } = usePostUploaderSummary(
    {
      ...range,
      limit: 10,
    },
    refetchQueryOptions(),
  );

  return (
    <QueryHint
      data={data}
      isLoading={isLoading}
      error={error}
      skeleton={Array.from({ length: 5 }).map((_, index) => (
        <PostUploaderFrame key={index} />
      ))}
    >
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
        {data?.map((user) => {
          return <PostUploaderFrame key={user.userId} summary={user} />;
        })}
      </LimitedList>
    </QueryHint>
  );
};
