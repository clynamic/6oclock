import { Beenhere, Flag, RestartAlt, Sell, Upload } from '@mui/icons-material';
import { ReactElement } from 'react';

import { Activity } from '../api';

export const getActivityFromKey = (key: string): Activity => {
  const result = Object.values(Activity).find(
    (activity) => activity.replace(/_/g, '') === key.toLowerCase(),
  ) as Activity;

  if (!result) {
    throw new Error(`Unknown activity key: ${key}`);
  }

  return result;
};

export const getActivityName = (activity: Activity): string => {
  switch (activity) {
    case Activity.post_create:
      return 'Posts uploaded';
    case Activity.post_approve:
      return 'Posts approved';
    case Activity.post_delete:
      return 'Posts deleted';
    case Activity.post_replacement_create:
      return 'Post Replacements created';
    case Activity.post_replacement_approve:
      return 'Post Replacements approved';
    case Activity.post_replacement_promote:
      return 'Post Replacements promoted';
    case Activity.post_replacement_reject:
      return 'Post Replacements rejected';
    case Activity.ticket_create:
      return 'Tickets created';
    case Activity.ticket_handle:
      return 'Tickets handled';
  }
};

export const getActivityNoun = (activity: Activity): string => {
  switch (activity) {
    case Activity.post_create:
      return 'Uploads';
    case Activity.post_approve:
      return 'Approvals';
    case Activity.post_delete:
      return 'Deletions';
    case Activity.post_replacement_create:
      return 'Replacements';
    case Activity.post_replacement_approve:
      return 'Replacements';
    case Activity.post_replacement_promote:
      return 'Promotions';
    case Activity.post_replacement_reject:
      return 'Rejections';
    case Activity.ticket_create:
      return 'Reports';
    case Activity.ticket_handle:
      return 'Tickets';
  }
};

export const getActivityIcon = (
  activity: Activity,
): ReactElement | undefined => {
  switch (activity) {
    case Activity.post_create:
      return <Upload />;
    case Activity.post_approve:
      return <Beenhere />;
    case Activity.post_delete:
      return <Flag />;
    case Activity.post_replacement_approve:
      return <RestartAlt />;
    case Activity.ticket_handle:
      return <Sell />;
    default:
      return undefined;
  }
};
