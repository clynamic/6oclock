import { AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';

import { miscFixInterceptors } from './misc';

const unwrapped = (data: unknown): unknown =>
  miscFixInterceptors({ data } as AxiosResponse).data;

describe('miscFixInterceptors', () => {
  it('lifts a post out of the wrapper e621 puts it in', () => {
    expect(unwrapped({ post: { id: 1 } })).toEqual({ id: 1 });
  });

  it('leaves a response carrying no post alone', () => {
    const body = { id: 1 };

    expect(unwrapped(body)).toBe(body);
  });

  it('leaves a bare array alone', () => {
    const body = [{ id: 1 }];

    expect(unwrapped(body)).toBe(body);
  });

  it('leaves null alone rather than reading a key off it', () => {
    expect(unwrapped(null)).toBeNull();
  });

  it('keeps the rest of the response while replacing the body', () => {
    const response = {
      status: 200,
      data: { post: { id: 1 } },
    } as unknown as AxiosResponse;

    expect(miscFixInterceptors(response).status).toBe(200);
  });

  describe('characterised, not specified', () => {
    it('rewrites the response in place rather than copying it', () => {
      const response = { data: { post: { id: 1 } } } as AxiosResponse;

      miscFixInterceptors(response);

      expect(response.data).toEqual({ id: 1 });
    });

    it('drops everything beside the post, whatever else came with it', () => {
      expect(unwrapped({ post: { id: 1 }, total: 5 })).toEqual({ id: 1 });
    });

    it('unwraps any field called post, even one that is not a post', () => {
      expect(unwrapped({ post: 'a string' })).toBe('a string');
    });
  });
});
