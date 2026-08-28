import type { Request } from 'express';

import { SESSION_COOKIE, readCookie } from './session-cookie';

const withCookies = (header?: string): Request =>
  ({ headers: header === undefined ? {} : { cookie: header } }) as Request;

describe('readCookie', () => {
  it('finds a cookie by its exact name', () => {
    expect(
      readCookie(withCookies('sixoclock_session=abc'), SESSION_COOKIE),
    ).toBe('abc');
  });

  it('finds a cookie sitting among others', () => {
    expect(
      readCookie(
        withCookies('theme=dark; sixoclock_session=abc; lang=en'),
        SESSION_COOKIE,
      ),
    ).toBe('abc');
  });

  it('ignores a cookie whose name merely ends with the one asked for', () => {
    expect(
      readCookie(
        withCookies('evil_sixoclock_session=stolen; sixoclock_session=real'),
        SESSION_COOKIE,
      ),
    ).toBe('real');
  });

  it('takes the first of two cookies sharing a name', () => {
    expect(
      readCookie(
        withCookies('sixoclock_session=first; sixoclock_session=second'),
        SESSION_COOKIE,
      ),
    ).toBe('first');
  });

  it('keeps everything after the first equals sign, since base64 pads with it', () => {
    expect(
      readCookie(withCookies('sixoclock_session=YWJjZA=='), SESSION_COOKIE),
    ).toBe('YWJjZA==');
  });

  it('decodes a percent-encoded value', () => {
    expect(
      readCookie(withCookies('sixoclock_session=a%2Fb%2Bc'), SESSION_COOKIE),
    ).toBe('a/b+c');
  });

  it('tolerates whitespace around the name and the value', () => {
    expect(
      readCookie(withCookies('  sixoclock_session =  abc  '), SESSION_COOKIE),
    ).toBe('abc');
  });

  it('skips a fragment carrying no equals sign', () => {
    expect(
      readCookie(withCookies('broken; sixoclock_session=abc'), SESSION_COOKIE),
    ).toBe('abc');
  });

  it('returns null when the header is absent', () => {
    expect(readCookie(withCookies(), SESSION_COOKIE)).toBeNull();
  });

  it('returns null when the header holds other cookies', () => {
    expect(readCookie(withCookies('theme=dark'), SESSION_COOKIE)).toBeNull();
  });

  it('returns an empty string for a cookie present but empty', () => {
    expect(readCookie(withCookies('sixoclock_session='), SESSION_COOKIE)).toBe(
      '',
    );
  });
});
