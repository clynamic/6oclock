import {
  Avatar,
  AvatarOwnProps,
  Skeleton,
  SkeletonOwnProps,
} from "@mui/material";

export interface UserAvatarProps {
  user?: {
    id: number;
    name?: string;
    avatar?: string;
  };
  size?: number;
  shape?: AvatarOwnProps["variant"] & SkeletonOwnProps["variant"];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 48,
  shape = "circular",
}) => {
  return user ? (
    <Avatar
      variant={shape}
      alt={`avatar of ${user?.name ?? `User #${user?.id}`}`}
      src={user?.avatar}
      sx={{
        width: size,
        height: size,
        bgcolor: "background.paper",
        color: "text.primary",
      }}
    >
      {user.name
        ?.split("_")
        .map((part) => part[0])
        .join("") ?? "?"}
    </Avatar>
  ) : (
    <Skeleton variant={shape} width={size} height={size} />
  );
};
