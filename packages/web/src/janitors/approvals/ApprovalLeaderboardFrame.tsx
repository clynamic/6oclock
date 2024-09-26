import { Beenhere, CalendarMonth } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Chip,
  Skeleton,
  Stack,
} from '@mui/material';
import { Link } from 'react-router-dom';

import { ApproverSummary } from '../../api';
import { UsernameText } from '../../common';
import { RankingText } from '../../common/RankingText';

export interface ApprovalLeaderboardFrame {
  summary?: ApproverSummary;
}

export const ApprovalLeaderboardFrame: React.FC<ApprovalLeaderboardFrame> = ({
  summary,
}) => {
  return (
    <Card
      sx={{
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={`/users/${summary?.userId ?? ''}`}
        disabled={!summary}
      >
        <Box p={2}>
          <Stack direction="row" spacing={2}>
            {summary ? (
              <Avatar
                variant="rounded"
                alt={`avatar of ${summary.head?.name ?? `User #${summary.userId}`}`}
                src={summary.head?.avatar}
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                }}
              >
                {summary.head?.name.split('_').map((part) => part[0]) ?? '?'}
              </Avatar>
            ) : (
              <Skeleton variant="rounded" width={64} height={64} />
            )}
            <Stack spacing={1} sx={{ flexGrow: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="space-between"
                alignItems="center"
              >
                <UsernameText user={summary} />
                {summary && (
                  <RankingText rank={summary.position}>
                    #{summary.position}
                  </RankingText>
                )}
              </Stack>
              <Stack direction="row" spacing={1}>
                {summary ? (
                  <>
                    <Chip
                      size="small"
                      avatar={<Beenhere />}
                      label={`${summary.total} approvals`}
                    />
                    {summary.days > 1 && (
                      <Chip
                        size="small"
                        avatar={<CalendarMonth />}
                        label={`${summary.days} days`}
                      />
                    )}
                  </>
                ) : (
                  <Skeleton width={100} />
                )}
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  );
};
