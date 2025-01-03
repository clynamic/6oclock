import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { useApproverSummary } from '../../api';
import { LimitedList, QueryHint } from '../../common';
import { refetchQueryOptions, useChartRange } from '../../utils';
import { ApproverFrame } from './ApproverFrame';

export const ApproverBoard: React.FC = () => {
  const range = useChartRange();

  const { data, isLoading, error } = useApproverSummary(
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
        <ApproverFrame key={index} />
      ))}
    >
      <LimitedList
        indicator={() => (
          <Stack direction="row" justifyContent="flex-end">
            <Button
              size="small"
              endIcon={<ArrowForward />}
              component={Link}
              to="/janitors/approvals"
            >
              See All
            </Button>
          </Stack>
        )}
      >
        {data?.map((approver) => {
          return <ApproverFrame key={approver.userId} summary={approver} />;
        })}
      </LimitedList>
    </QueryHint>
  );
};
