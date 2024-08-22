import { ArrowForward } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import dayjs from "dayjs";
import { useMemo } from "react";

import { PostVersion } from "../../api";
import { LimitedList } from "../../common";
import { useDrain, useManyPosts,useManyUsers } from "../../utils";
import { UploaderFrame } from "./UploaderFrame";
import { getUploaders } from "./uploaders";

export interface UploaderBoardProps {
  postVersions?: PostVersion[];
}

export const UploaderBoard: React.FC<UploaderBoardProps> = ({
  postVersions,
}) => {
  const allUploaders = getUploaders(postVersions);
  const uploaders = useMemo(() => allUploaders?.slice(0, 10), [allUploaders]);

  const mockUploaders = Array.from({ length: 5 }, (_, i) => ({
    user: i + 1,
    count: 5 - i,
    dates: Array.from({ length: 5 - i }, (_, j) =>
      dayjs().add(j, "day").toDate()
    ),
  }));

  const { data: users } = useDrain(useManyUsers(uploaders?.map((r) => r.user)));
  const { data: avatars } = useDrain(
    useManyPosts(
      users
        ?.filter((u) => u.avatar_id != null)
        .map((u) => u.avatar_id) as number[]
    )
  );

  return (
    <LimitedList
      indicator={() => (
        <Stack direction="row" justifyContent="flex-end">
          <Button size="small" endIcon={<ArrowForward />}>
            See All ({allUploaders?.length})
          </Button>
        </Stack>
      )}
    >
      {(uploaders ?? mockUploaders).map((uploader, index) => {
        const user = users?.find((user) => user.id === uploader.user);
        const avatar = avatars?.find((post) => post.id === user?.avatar_id);
        return (
          <UploaderFrame
            key={uploader.user}
            uploader={uploader}
            position={index + 1}
            user={user}
            avatar={avatar}
          />
        );
      })}
    </LimitedList>
  );
};
