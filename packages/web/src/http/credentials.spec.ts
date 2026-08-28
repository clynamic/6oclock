import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { login, logout, takePostLoginRedirect } from './credentials';

const post = vi.fn();

vi.mock('./axios', () => ({
  baseURL: 'https://six.example/api',
  AXIOS_INSTANCE: {
    post: (...args: unknown[]) => post(...args),
  },
}));

let stored: Record<string, string>;
let navigatedTo: string;

beforeEach(() => {
  stored = {};
  navigatedTo = '';
  post.mockReset().mockResolvedValue(undefined);

  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => stored[key] ?? null,
    setItem: (key: string, value: string) => {
      stored[key] = value;
    },
    removeItem: (key: string) => {
      delete stored[key];
    },
  });

  vi.stubGlobal('window', {
    location: {
      set href(value: string) {
        navigatedTo = value;
      },
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('login', () => {
  it('sends the browser to the server login route', () => {
    login();

    expect(navigatedTo).toBe('https://six.example/api/auth/login');
  });

  it('remembers where to come back to', () => {
    login('/tickets');

    expect(takePostLoginRedirect()).toBe('/tickets');
  });

  it('remembers nothing when nowhere was named', () => {
    login();

    expect(takePostLoginRedirect()).toBeNull();
  });

  it('remembers nothing when the caller explicitly names nowhere', () => {
    login(null);

    expect(takePostLoginRedirect()).toBeNull();
  });

  it('navigates even when it has nowhere to come back to', () => {
    login();

    expect(navigatedTo).toBe('https://six.example/api/auth/login');
  });
});

describe('takePostLoginRedirect', () => {
  it('gives back nothing when no login is pending', () => {
    expect(takePostLoginRedirect()).toBeNull();
  });

  it('hands the destination over only once', () => {
    login('/tickets');

    expect(takePostLoginRedirect()).toBe('/tickets');
    expect(takePostLoginRedirect()).toBeNull();
  });

  it('clears the destination even as it returns it', () => {
    login('/tickets');
    takePostLoginRedirect();

    expect(Object.keys(stored)).toEqual([]);
  });

  it('keeps the newest destination when a login is started twice', () => {
    login('/tickets');
    login('/flags');

    expect(takePostLoginRedirect()).toBe('/flags');
  });
});

describe('logout', () => {
  it('tells the server to end the session', async () => {
    await logout();

    expect(post).toHaveBeenCalledWith('/auth/logout');
  });

  it('returns quietly when the server cannot be reached, since the caller navigates away', async () => {
    post.mockRejectedValue(new Error('network down'));

    await expect(logout()).resolves.toBeUndefined();
  });

  it('leaves a pending redirect alone, since logging out is not logging in', async () => {
    login('/tickets');

    await logout();

    expect(takePostLoginRedirect()).toBe('/tickets');
  });
});
