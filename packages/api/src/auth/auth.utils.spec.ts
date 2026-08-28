import { encodeCredentials } from './auth.utils';

describe('encodeCredentials', () => {
  it('builds a basic credential the way the scheme names it', () => {
    expect(
      encodeCredentials({ username: 'someone', password: 'a-secret' }),
    ).toBe(`Basic ${btoa('someone:a-secret')}`);
  });

  it('carries a password holding a colon through intact', () => {
    const header = encodeCredentials({
      username: 'someone',
      password: 'a:secret',
    });

    expect(atob(header.replace('Basic ', ''))).toBe('someone:a:secret');
  });
});
