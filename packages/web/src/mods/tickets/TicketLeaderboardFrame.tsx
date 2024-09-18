import { CalendarMonth, Sell } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Skeleton,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { TicketHandlerSummary } from '../../api';
import { UserAvatar, UsernameText } from '../../common';
import { RankingText } from '../../common/RankingText';

export interface TicketLeaderboardFrameProps {
  summary?: TicketHandlerSummary;
}

export const TicketLeaderboardFrame: React.FC<TicketLeaderboardFrameProps> = ({
  summary,
}) => {
  const navigate = useNavigate();

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
        onClick={
          summary ? () => navigate(`/users/${summary?.userId}`) : undefined
        }
        disabled={!summary}
      >
        <Box p={2} sx={{ width: '100%' }}>
          <Stack direction="row" spacing={2}>
            <UserAvatar
              user={
                summary ? { id: summary.userId, ...summary.head } : undefined
              }
              size={64}
              shape="rounded"
            />
            <Stack spacing={1} sx={{ flexGrow: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="space-between"
                alignItems="center"
              >
                <UsernameText user={summary?.head} />
                {summary && (
                  <RankingText rank={summary.position}>
                    #{summary.position}
                  </RankingText>
                )}
              </Stack>
              <Stack
                direction="row"
                gap={1}
                sx={{ flexWrap: 'wrap', maxWidth: 300 }}
              >
                {summary ? (
                  <>
                    <Chip
                      size="small"
                      avatar={<Sell />}
                      label={`${summary.total} tickets`}
                    />
                    {summary.days > 1 && (
                      <Chip
                        size="small"
                        avatar={<CalendarMonth />}
                        label={`${summary.days} days`}
                      />
                    )}
                    {/* TODO: actually calculate trends with previous month's data */}
                    {/* <Chip size="small" label={<TrendingUp />} /> */}
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
