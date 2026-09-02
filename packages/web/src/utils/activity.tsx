import { ReactElement } from 'react';

import {
  Beenhere,
  Brush,
  CommentsDisabled,
  Delete,
  Feedback,
  Forum,
  Gavel,
  OutlinedFlag,
  RestartAlt,
  RestoreFromTrash,
  Sell,
  StickyNote2,
} from '@mui/icons-material';

export interface ActionLabel {
  noun: string;
  name: string;
  icon?: ReactElement;
}

const ACTION_LABELS: Record<string, ActionLabel> = {
  approved: { noun: 'Approvals', name: 'Posts approved', icon: <Beenhere /> },
  deleted: { noun: 'Deletions', name: 'Posts deleted', icon: <Delete /> },
  expunged: { noun: 'Expunges', name: 'Posts expunged', icon: <Delete /> },
  undeleted: {
    noun: 'Restores',
    name: 'Posts restored',
    icon: <RestoreFromTrash />,
  },
  unapproved: { noun: 'Unapprovals', name: 'Posts unapproved' },
  replacement_accepted: {
    noun: 'Replacements accepted',
    name: 'Replacements accepted',
    icon: <RestartAlt />,
  },
  replacement_rejected: {
    noun: 'Replacements rejected',
    name: 'Replacements rejected',
    icon: <RestartAlt />,
  },
  replacement_promoted: {
    noun: 'Replacements promoted',
    name: 'Replacements promoted',
    icon: <RestartAlt />,
  },
  replacement_deleted: {
    noun: 'Replacements deleted',
    name: 'Replacements deleted',
  },
  replacement_penalty_changed: {
    noun: 'Penalties changed',
    name: 'Replacement penalties changed',
  },
  flag_created: {
    noun: 'Flags raised',
    name: 'Flags raised',
    icon: <OutlinedFlag />,
  },
  flag_removed: {
    noun: 'Flags dismissed',
    name: 'Flags dismissed',
    icon: <OutlinedFlag />,
  },
  ticket_update_approved: {
    noun: 'Tickets',
    name: 'Tickets handled',
    icon: <Sell />,
  },
  ticket_update_partial: {
    noun: 'Tickets in progress',
    name: 'Tickets put under investigation',
    icon: <Sell />,
  },
  user_ban: { noun: 'Bans', name: 'Users banned', icon: <Gavel /> },
  user_unban: { noun: 'Unbans', name: 'Users unbanned', icon: <Gavel /> },
  user_ban_update: { noun: 'Ban edits', name: 'Bans edited', icon: <Gavel /> },
  user_feedback_create: {
    noun: 'Feedbacks',
    name: 'Feedbacks written',
    icon: <Feedback />,
  },
  user_feedback_update: { noun: 'Feedback edits', name: 'Feedbacks edited' },
  user_feedback_delete: {
    noun: 'Feedbacks removed',
    name: 'Feedbacks removed',
  },
  user_feedback_destroy: {
    noun: 'Feedbacks destroyed',
    name: 'Feedbacks destroyed',
  },
  user_feedback_undelete: {
    noun: 'Feedbacks restored',
    name: 'Feedbacks restored',
  },
  user_uploads_toggle: {
    noun: 'Upload toggles',
    name: 'Upload rights toggled',
  },
  staff_note_create: {
    noun: 'Staff notes',
    name: 'Staff notes written',
    icon: <StickyNote2 />,
  },
  staff_note_update: { noun: 'Note edits', name: 'Staff notes edited' },
  staff_note_delete: { noun: 'Notes removed', name: 'Staff notes removed' },
  comment_hide: {
    noun: 'Comments hidden',
    name: 'Comments hidden',
    icon: <CommentsDisabled />,
  },
  comment_update: { noun: 'Comments marked', name: 'Comments marked' },
  comment_delete: { noun: 'Comments deleted', name: 'Comments deleted' },
  comment_unhide: { noun: 'Comments unhidden', name: 'Comments unhidden' },
  forum_post_hide: {
    noun: 'Forum posts hidden',
    name: 'Forum posts hidden',
    icon: <Forum />,
  },
  forum_post_update: {
    noun: 'Forum post edits',
    name: 'Forum posts edited',
    icon: <Forum />,
  },
  forum_post_unhide: {
    noun: 'Forum posts unhidden',
    name: 'Forum posts unhidden',
  },
  forum_topic_hide: { noun: 'Topics hidden', name: 'Forum topics hidden' },
  forum_topic_lock: { noun: 'Topics locked', name: 'Forum topics locked' },
  forum_topic_unhide: {
    noun: 'Topics unhidden',
    name: 'Forum topics unhidden',
  },
  forum_topic_unlock: {
    noun: 'Topics unlocked',
    name: 'Forum topics unlocked',
  },
  forum_topic_unstick: { noun: 'Topics unstuck', name: 'Forum topics unstuck' },
  artist_user_linked: {
    noun: 'Artists linked',
    name: 'Artists linked to users',
    icon: <Brush />,
  },
  artist_user_unlinked: { noun: 'Artists unlinked', name: 'Artists unlinked' },
  pool_delete: { noun: 'Pools deleted', name: 'Pools deleted' },
  takedown_process: { noun: 'Takedowns', name: 'Takedowns processed' },
  avoid_posting_create: {
    noun: 'DNP entries',
    name: 'Do-not-post entries created',
  },
  avoid_posting_update: {
    noun: 'DNP edits',
    name: 'Do-not-post entries edited',
  },
  avoid_posting_delete: {
    noun: 'DNP removals',
    name: 'Do-not-post entries removed',
  },
  aibur_approved: {
    noun: 'AIBURs approved',
    name: 'Alias and implication requests approved',
  },
  aibur_rejected: {
    noun: 'AIBURs rejected',
    name: 'Alias and implication requests rejected',
  },
  aibur_retired: {
    noun: 'Aliases retired',
    name: 'Aliases and implications retired',
  },
  blip_hide: { noun: 'Blips hidden', name: 'Blips hidden' },
  blip_update: { noun: 'Blip edits', name: 'Blips edited' },
  wiki_page_lock: { noun: 'Wiki pages locked', name: 'Wiki pages locked' },
};

const humanise = (key: string): string => {
  const words = key.replace(/_/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const describeAction = (key: string): ActionLabel =>
  ACTION_LABELS[key] ?? { noun: humanise(key), name: humanise(key) };
