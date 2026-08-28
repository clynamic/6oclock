import { describe, expect, it } from 'vitest';

import { Activity } from '../api';
import {
  getActivityFromKey,
  getActivityName,
  getActivityNoun,
} from './activity';

const ALL = Object.values(Activity) as Activity[];

describe('getActivityFromKey', () => {
  it.each(ALL)('reads %s back from the key the api sends', (activity) => {
    const key = activity.replace(/_(.)/g, (_, letter: string) =>
      letter.toUpperCase(),
    );

    expect(getActivityFromKey(key)).toBe(activity);
  });

  it('refuses a key it has never heard of rather than guessing', () => {
    expect(() => getActivityFromKey('somethingElse')).toThrow(
      'Unknown activity key',
    );
  });

  it('refuses an empty key', () => {
    expect(() => getActivityFromKey('')).toThrow('Unknown activity key');
  });
});

describe('getActivityName', () => {
  it.each(ALL)('names %s for a reader', (activity) => {
    expect(getActivityName(activity)).toBeTruthy();
  });

  it('gives every activity a name of its own', () => {
    const names = ALL.map(getActivityName);

    expect(new Set(names).size).toBe(ALL.length);
  });

  it('says what happened to the thing, not just the thing', () => {
    expect(getActivityName(Activity.ticket_handle)).toBe('Tickets handled');
    expect(getActivityName(Activity.ticket_create)).toBe('Tickets created');
  });
});

describe('getActivityNoun', () => {
  it.each(ALL)('gives %s a short column heading', (activity) => {
    expect(getActivityNoun(activity)).toBeTruthy();
  });

  it('keeps creating a ticket apart from handling one', () => {
    expect(getActivityNoun(Activity.ticket_create)).not.toBe(
      getActivityNoun(Activity.ticket_handle),
    );
  });

  describe('characterised, not specified', () => {
    it('gives creating and approving a replacement the same heading', () => {
      expect(getActivityNoun(Activity.post_replacement_create)).toBe(
        getActivityNoun(Activity.post_replacement_approve),
      );
    });

    it('so a csv naming both columns cannot tell them apart', () => {
      const headings = [
        Activity.post_replacement_create,
        Activity.post_replacement_approve,
      ].map(getActivityNoun);

      expect(new Set(headings).size).toBe(1);
    });
  });
});
