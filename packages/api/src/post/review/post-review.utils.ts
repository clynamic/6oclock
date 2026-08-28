import { PostEventAction } from 'src/api';

import { PostReviewExit } from './post-review.entity';

export interface PostReviewUpload {
  postId: number;
  uploadedAt: Date;
}

export interface PostReviewEvent {
  post_id: number;
  created_at: Date;
  action: PostEventAction;
}

export interface PostReviewEpisodeData {
  postId: number;
  enteredAt: Date;
  exitedAt: Date | null;
  exit: PostReviewExit | null;
}

const exitFor = (action: PostEventAction): PostReviewExit | undefined => {
  switch (action) {
    case PostEventAction.approved:
      return PostReviewExit.approved;
    case PostEventAction.deleted:
      return PostReviewExit.deleted;
    default:
      return undefined;
  }
};

export const reconstructReviewEpisodes = (
  uploads: PostReviewUpload[],
  events: PostReviewEvent[],
  permitted: Set<number>,
): PostReviewEpisodeData[] => {
  const entries = new Map<number, Date>(
    uploads.map((upload) => [upload.postId, upload.uploadedAt]),
  );

  const byPost = new Map<number, PostReviewEvent[]>();
  for (const event of events) {
    const list = byPost.get(event.post_id);
    if (list) {
      list.push(event);
    } else {
      byPost.set(event.post_id, [event]);
    }
  }

  const postIds = new Set([...entries.keys(), ...byPost.keys()]);
  const episodes: PostReviewEpisodeData[] = [];

  for (const postId of postIds) {
    if (permitted.has(postId)) continue;

    const entered = entries.get(postId);

    let open: PostReviewEpisodeData | null = entered
      ? { postId, enteredAt: entered, exitedAt: null, exit: null }
      : null;

    for (const event of byPost.get(postId) ?? []) {
      const exit = exitFor(event.action);

      if (exit) {
        if (!open) continue;
        open.exitedAt = event.created_at;
        open.exit = exit;
        episodes.push(open);
        open = null;
      } else if (event.action === PostEventAction.unapproved && !open) {
        open = {
          postId,
          enteredAt: event.created_at,
          exitedAt: null,
          exit: null,
        };
      }
    }

    if (open) episodes.push(open);
  }

  return episodes;
};
