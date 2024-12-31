import { Activity } from '../api';

export const getActivityName = (activity: Activity): string => {
  switch (activity) {
    case Activity.post_create:
      return 'Create Post';
    case Activity.post_approve:
      return 'Approve Post';
    case Activity.post_delete:
      return 'Delete Post';
    case Activity.post_replacement_create:
      return 'Create Post Replacement';
    case Activity.post_replacement_approve:
      return 'Approve Post Replacement';
    case Activity.post_replacement_reject:
      return 'Reject Post Replacement';
    case Activity.ticket_create:
      return 'Create Ticket';
    case Activity.ticket_handle:
      return 'Handle Ticket';
  }
};
