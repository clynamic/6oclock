import { Skeleton, Typography } from "@mui/material";
import { useMemo } from "react";

import { UserHead } from "../api";

type UsernameInfo = Pick<UserHead, "name" | "level">;

export interface UsernameTextProps {
  user:
    | UsernameInfo
    | {
        userId: number;
        head?: UsernameInfo;
      }
    | undefined;
}

/**
 *  from https://github.com/e621ng/e621ng/blob/708583b5e8ef24a4cfa6c1a230ff8f88fb652b02/app/javascript/src/styles/themes/_theme_hexagon.scss#L61-L77
 *
 *   --color-user-member:            #b4c7d9;
 *   --color-user-member-alt:        #2e76b4;
 *   --color-user-privileged:        #b4c7d9;
 *   --color-user-privileged-alt:    #2e76b4;
 *
 *   --color-user-blocked:           #b4c7d9;
 *   --color-user-blocked-alt:       #2e76b4;
 *
 *   --color-user-former-staff:      #78dca5;
 *   --color-user-former-staff-alt:  #4da073;
 *   --color-user-janitor:           #d82828;
 *   --color-user-janitor-alt:       #cc5151;
 *   --color-user-moderator:         #d82828;
 *   --color-user-moderator-alt:     #cc5151;
 *   --color-user-admin:             #e69500;
 *   --color-user-admin-alt:         #9d6703;
 */
const UsernameColors: Record<string, string> = {
  member: "#b4c7d9",
  privileged: "#b4c7d9",
  blocked: "#b4c7d9",
  "former-staff": "#78dca5",
  janitor: "#d82828",
  moderator: "#d82828",
  admin: "#e69500",
};

export const UsernameText = ({ user }: UsernameTextProps) => {
  const head = useMemo(() => {
    if (!user) return undefined;
    if ("userId" in user)
      return (
        user.head ?? {
          name: `User #${user.userId}`,
          level: "member",
        }
      );
    return user as UsernameInfo;
  }, [user]);

  if (!head) return <Skeleton width={120} />;

  const { name, level } = head;
  const color =
    UsernameColors[level.replace(" ", "-").toLowerCase()] ?? "inherit";

  return (
    <Typography
      variant="h6"
      sx={{ color }}
      noWrap
      textOverflow={"ellipsis"}
      whiteSpace={"nowrap"}
      overflow={"hidden"}
    >
      {name.replace("_", " ")}
    </Typography>
  );
};
