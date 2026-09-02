import { describe, expect, it } from 'vitest';

import { describeAction } from './activity';

describe('describeAction', () => {
  it('names a scored action with a noun, a sentence and an icon', () => {
    const label = describeAction('deleted');
    expect(label.noun).toBe('Deletions');
    expect(label.name).toBe('Posts deleted');
    expect(label.icon).toBeDefined();
  });

  it('keeps the two ticket outcomes apart', () => {
    expect(describeAction('ticket_update_approved').noun).not.toBe(
      describeAction('ticket_update_partial').noun,
    );
  });

  it('spells out a key it has never heard of rather than throwing', () => {
    const label = describeAction('mascot_create');
    expect(label.noun).toBe('Mascot create');
    expect(label.icon).toBeUndefined();
  });
});
