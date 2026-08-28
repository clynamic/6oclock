import { toRawQuery, toRawUrl, toRaws } from './raw';

describe('toRaws', () => {
  it('drops undefined, null and functions', () => {
    expect(
      toRaws({
        kept: 'yes',
        missing: undefined,
        empty: null,
        method: () => 'no',
      }),
    ).toEqual({ kept: 'yes' });
  });

  it('keeps a false, a zero and an empty string, which are values', () => {
    expect(toRaws({ off: false, none: 0, blank: '' })).toEqual({
      off: false,
      none: 0,
      blank: '',
    });
  });
});

describe('toRawQuery', () => {
  it('writes nothing when given no object', () => {
    expect(toRawQuery(undefined)).toBe('');
    expect(toRawQuery({})).toBe('');
  });

  it('repeats a key once per array element', () => {
    expect(toRawQuery({ id: [1, 2, 3] })).toBe('id=1&id=2&id=3');
  });

  it('encodes a value that would otherwise change the query', () => {
    expect(toRawQuery({ tags: 'a b&c=d' })).toBe('tags=a%20b%26c%3Dd');
  });

  it('leaves a dropped key out of the query entirely', () => {
    expect(toRawQuery({ kept: 1, gone: undefined })).toBe('kept=1');
  });
});

describe('toRawUrl', () => {
  it('writes nothing when given no arguments', () => {
    expect(toRawUrl()).toBe('');
  });

  it('joins scalars into a path', () => {
    expect(toRawUrl('users', 5)).toBe('/users/5');
  });

  it('turns an object into the query rather than a path segment', () => {
    expect(toRawUrl('users', { page: 2 })).toBe('/users?page=2');
  });

  it('merges several objects into one query', () => {
    expect(toRawUrl({ page: 2 }, { limit: 10 })).toBe('?page=2&limit=10');
  });

  it('skips an argument it was given as undefined', () => {
    expect(toRawUrl('users', undefined, 5, null)).toBe('/users/5');
  });

  it('separates arguments given in a different order', () => {
    expect(toRawUrl('a', 'b')).not.toBe(toRawUrl('b', 'a'));
  });

  it('tells a scalar apart from a single element array', () => {
    expect(toRawUrl(5)).not.toBe(toRawUrl([5]));
  });

  it('marks an array so its elements cannot read as separate segments', () => {
    expect(toRawUrl([1, 2])).toBe('/%5B1%2C2%5D');
    expect(toRawUrl([1, 2])).not.toBe(toRawUrl(1, 2));
  });
});
