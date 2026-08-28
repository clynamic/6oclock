import { AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';

import { objectUnpackInterceptor } from './unpack';

const unpacked = (data: unknown): unknown =>
  objectUnpackInterceptor({ data } as AxiosResponse).data;

describe('objectUnpackInterceptor', () => {
  it('lifts the array out of a wrapper carrying nothing else', () => {
    expect(unpacked({ tickets: [1, 2, 3] })).toEqual([1, 2, 3]);
  });

  it('lifts an empty array out too, so a caller always gets a list', () => {
    expect(unpacked({ tickets: [] })).toEqual([]);
  });

  it('leaves a wrapper carrying more than one key alone', () => {
    const body = { tickets: [1], total: 1 };

    expect(unpacked(body)).toBe(body);
  });

  it('leaves a single key holding something other than an array alone', () => {
    const body = { ticket: { id: 1 } };

    expect(unpacked(body)).toBe(body);
  });

  it('leaves a response that is already an array alone', () => {
    const body = [1, 2, 3];

    expect(unpacked(body)).toBe(body);
  });

  it('leaves null alone rather than reading keys off it', () => {
    expect(unpacked(null)).toBeNull();
  });

  it('leaves a plain string alone', () => {
    expect(unpacked('a body')).toBe('a body');
  });

  it('keeps the rest of the response while replacing the body', () => {
    const response = {
      status: 200,
      data: { tickets: [1] },
    } as unknown as AxiosResponse;

    expect(objectUnpackInterceptor(response).status).toBe(200);
  });
});
