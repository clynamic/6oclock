import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { useApproverSummary } from '../../api';
import { LimitedList, NoDataHint } from '../../common';
import { refetchQueryOptions, useChartDateRange } from '../../utils';
import { ApprovalLeaderboardFrame } from './ApprovalLeaderboardFrame';

export const ApprovalLeaderboard: React.FC = () => {
  const range = useChartDateRange();

  const { data: approvers } = useApproverSummary(
    {
      ...range,
      limit: 10,
    },
    refetchQueryOptions(),
  );

  if (approvers?.length === 0) return <NoDataHint />;

  return (
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
      {approvers
        ? approvers.map((approver) => {
            return (
              <ApprovalLeaderboardFrame
                key={approver.userId}
                summary={approver}
              />
            );
          })
        : Array.from({ length: 5 }).map((_, i) => (
            <ApprovalLeaderboardFrame key={i} />
          ))}
    </LimitedList>
  );
};
