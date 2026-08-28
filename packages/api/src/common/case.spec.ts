import { convertKeysToCamelCase } from './case';

describe('convertKeysToCamelCase', () => {
  it('turns a snake case key into a camel case one', () => {
    expect(convertKeysToCamelCase({ creator_id: 500 })).toEqual({
      creatorId: 500,
    });
  });

  it('joins every part of a long key', () => {
    expect(convertKeysToCamelCase({ post_replacement_id: 1 })).toEqual({
      postReplacementId: 1,
    });
  });

  it('leaves a key that is already camel case alone', () => {
    expect(convertKeysToCamelCase({ creatorId: 500 })).toEqual({
      creatorId: 500,
    });
  });

  it('carries the value through untouched, whatever it is', () => {
    const nested = { created_at: '2024-03-01' };

    expect(convertKeysToCamelCase({ label: nested }).label).toBe(nested);
  });

  it('converts every key it was handed', () => {
    expect(
      convertKeysToCamelCase({ creator_id: 1, updated_at: 'x', id: 2 }),
    ).toEqual({ creatorId: 1, updatedAt: 'x', id: 2 });
  });

  it('gives back an empty object for an empty one', () => {
    expect(convertKeysToCamelCase({})).toEqual({});
  });

  it('keeps a null value rather than dropping the key', () => {
    expect(convertKeysToCamelCase({ handler_id: null })).toEqual({
      handlerId: null,
    });
  });

  it('builds a new object rather than rewriting the one it was given', () => {
    const original = { creator_id: 500 };

    convertKeysToCamelCase(original);

    expect(original).toEqual({ creator_id: 500 });
  });

  describe('characterised, not specified', () => {
    it('leaves an underscore before a digit in place', () => {
      expect(convertKeysToCamelCase({ md5_1: 'x' })).toEqual({ md5_1: 'x' });
    });

    it('leaves an underscore before a capital in place', () => {
      expect(convertKeysToCamelCase({ post_ID: 1 })).toEqual({ post_ID: 1 });
    });

    it('shallow converts, so a nested object keeps its snake case keys', () => {
      expect(convertKeysToCamelCase({ outer_key: { inner_key: 1 } })).toEqual({
        outerKey: { inner_key: 1 },
      });
    });
  });
});
