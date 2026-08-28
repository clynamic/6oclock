import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveHref } from './navigation';

let warned: string[];

beforeEach(() => {
  warned = [];
  vi.spyOn(console, 'warn').mockImplementation((message: string) => {
    warned.push(message);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('resolveHref', () => {
  it('fills a placeholder with the value it was given', () => {
    expect(resolveHref('/users/:userId', { userId: '500' })).toBe('/users/500');
  });

  it('fills every placeholder in the path', () => {
    expect(
      resolveHref('/users/:userId/tickets/:ticketId', {
        userId: '500',
        ticketId: '7',
      }),
    ).toBe('/users/500/tickets/7');
  });

  it('leaves a path carrying no placeholder alone', () => {
    expect(resolveHref('/health/tiles', { userId: '500' })).toBe(
      '/health/tiles',
    );
  });

  it('leaves a placeholder it has no value for in place', () => {
    expect(resolveHref('/users/:userId', {})).toBe('/users/:userId');
  });

  it('says which value was missing, rather than failing quietly', () => {
    resolveHref('/users/:userId', {});

    expect(warned[0]).toContain('userId');
  });

  it('fills what it can and leaves the rest, so a partial link still points somewhere', () => {
    expect(
      resolveHref('/users/:userId/tickets/:ticketId', { userId: '500' }),
    ).toBe('/users/500/tickets/:ticketId');
  });

  it('reads a placeholder up to the next slash, not past it', () => {
    expect(resolveHref('/users/:userId/edit', { userId: '500' })).toBe(
      '/users/500/edit',
    );
  });

  it('takes an underscore as part of the name', () => {
    expect(resolveHref('/a/:user_id', { user_id: '500' })).toBe('/a/500');
  });

  it('leaves a bare colon alone, since it names nothing', () => {
    expect(resolveHref('/a/:/b', {})).toBe('/a/:/b');
    expect(warned).toEqual([]);
  });
});
