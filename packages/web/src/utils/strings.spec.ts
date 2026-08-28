import { describe, expect, it } from 'vitest';

import { capitalizeWords } from './strings';

describe('capitalizeWords', () => {
  it('raises the first letter of a single word', () => {
    expect(capitalizeWords('janitor')).toBe('Janitor');
  });

  it('raises the first letter of every word', () => {
    expect(capitalizeWords('post replacements')).toBe('Post Replacements');
  });

  it('leaves a word already capitalised alone', () => {
    expect(capitalizeWords('Janitor')).toBe('Janitor');
  });

  it('gives back nothing for nothing', () => {
    expect(capitalizeWords('')).toBe('');
  });

  describe('characterised, not specified', () => {
    it('raises the first letter without lowering the rest', () => {
      expect(capitalizeWords('jANITOR')).toBe('JANITOR');
    });

    it('keeps double spaces, since it splits on a single one', () => {
      expect(capitalizeWords('a  b')).toBe('A  B');
    });
  });
});
