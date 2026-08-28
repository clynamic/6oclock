import { InternalAxiosRequestConfig } from 'axios';

import { POST_FORMAT, postFormatInterceptor } from './format';

const apply = (url: string, params?: Record<string, unknown>) =>
  postFormatInterceptor({ url, params } as InternalAxiosRequestConfig).params;

describe('postFormatInterceptor', () => {
  it.each([
    '/posts.json',
    '/posts/random.json',
    '/posts/123.json',
    '/posts/123/update_iqdb.json',
    '/posts/123/show_seq.json',
    '/posts/123/mark_as_translated.json',
    '/post_events.json',
    '/favorites.json',
    '/popular.json',
  ])('pins the response format on %s', (url) => {
    expect(apply(url)).toMatchObject({ v2: 'true', mode: POST_FORMAT.mode });
  });

  it.each([
    '/tickets.json',
    '/users.json',
    '/post_flags.json',
    '/post_versions.json',
    '/posts',
    '/posts.json/extra',
  ])('leaves %s alone', (url) => {
    expect(apply(url)).toBeUndefined();
  });

  it.each([
    '/posts.json?tags=canine',
    '/posts/123.json?expand=1',
    '/post_events.json?page=2',
  ])('pins the format on %s, whose path carries a query', (url) => {
    expect(apply(url)).toMatchObject({ v2: 'true', mode: POST_FORMAT.mode });
  });

  it('reads the path out of an absolute url', () => {
    expect(apply('https://e621.net/posts.json?tags=canine')).toMatchObject({
      v2: 'true',
    });
  });

  it('keeps the caller’s own parameters', () => {
    expect(apply('/posts.json', { tags: 'canine', limit: 10 })).toMatchObject({
      tags: 'canine',
      limit: 10,
      v2: 'true',
    });
  });

  it('handles an absolute url', () => {
    expect(apply('https://e621.net/posts.json')).toMatchObject({ v2: 'true' });
  });

  it('overrides a caller trying to choose another format', () => {
    expect(
      apply('/posts.json', { v2: 'false', mode: 'thumbnail' }),
    ).toMatchObject({
      v2: 'true',
      mode: POST_FORMAT.mode,
    });
  });
});
