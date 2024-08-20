import { Ticket } from "../api";
import { Box, Stack, Typography } from "@mui/material";
import { ContributionFrame } from "./ContributionFrame";
import { useTicketContributors } from "./contributions";

export interface TicketLeaderboardProps {
  tickets?: Ticket[];
}

export const TicketLeaderboard: React.FC<TicketLeaderboardProps> = ({
  tickets,
}) => {
  const { data } = useTicketContributors(tickets);

  return (
    <Box m={2}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Stack spacing={2}>
          <Typography variant="h5">Leaderboard</Typography>
          {data?.contributions.map((contribution, index) => {
            const user = data?.users?.find(
              (user) => user.id === contribution.user
            );
            const avatar = data?.avatars?.find(
              (post) => post.id === user?.avatar_id
            );
            return (
              <ContributionFrame
                key={contribution.user}
                contribution={contribution}
                position={index + 1}
                user={user}
                avatar={avatar}
              />
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
};
