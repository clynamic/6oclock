import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';

import { dateDeserializeInterceptor, dateSanitizerInterceptor } from './date';

const responding = (data: unknown): AxiosResponse =>
  ({ data }) as AxiosResponse;

const deserialized = (data: unknown): unknown =>
  dateDeserializeInterceptor(responding(data)).data;

const sent = (params: unknown): Record<string, unknown> =>
  dateSanitizerInterceptor({ params } as InternalAxiosRequestConfig)
    .params as Record<string, unknown>;

describe('reading dates out of a response', () => {
  it('turns a full timestamp into a date', () => {
    expect(deserialized({ createdAt: '2024-03-01T12:30:00Z' })).toEqual({
      createdAt: new Date('2024-03-01T12:30:00Z'),
    });
  });

  it('turns a bare calendar day into a date', () => {
    expect(deserialized({ day: '2024-03-01' })).toEqual({
      day: new Date('2024-03-01'),
    });
  });

  it('reaches into nested objects', () => {
    expect(deserialized({ outer: { inner: '2024-03-01' } })).toEqual({
      outer: { inner: new Date('2024-03-01') },
    });
  });

  it('reaches into arrays', () => {
    expect(deserialized([{ at: '2024-03-01' }])).toEqual([
      { at: new Date('2024-03-01') },
    ]);
  });

  it('leaves a string that is not a date alone', () => {
    expect(deserialized({ name: 'someone' })).toEqual({ name: 'someone' });
  });

  it('leaves a number that looks like a year alone', () => {
    expect(deserialized({ count: 2024 })).toEqual({ count: 2024 });
  });

  it('leaves null alone rather than reading it as an epoch', () => {
    expect(deserialized({ at: null })).toEqual({ at: null });
  });

  it('refuses a timestamp missing its seconds', () => {
    expect(deserialized({ at: '2024-03-01T12:30' })).toEqual({
      at: '2024-03-01T12:30',
    });
  });

  it('refuses a date with a timezone offset rather than a Z', () => {
    expect(deserialized({ at: '2024-03-01T12:30:00+01:00' })).toEqual({
      at: '2024-03-01T12:30:00+01:00',
    });
  });

  describe('characterised, not specified', () => {
    it('rewrites the response body in place rather than copying it', () => {
      const body = { at: '2024-03-01' };

      dateDeserializeInterceptor(responding(body));

      expect(body.at).toBeInstanceOf(Date);
    });

    it('turns a date-shaped string that is not a real date into an invalid one', () => {
      const result = deserialized({ at: '1234-56-78' }) as { at: Date };

      expect(result.at).toBeInstanceOf(Date);
      expect(Number.isNaN(result.at.getTime())).toBe(true);
    });
  });
});

describe('sending dates as parameters', () => {
  it('drops the empty time off a start date, so the url stays a plain day', () => {
    expect(sent({ startDate: new Date(2024, 2, 1, 0, 0, 0, 0) })).toEqual({
      startDate: '2024-03-01',
    });
  });

  it('drops the empty time off an end date too', () => {
    expect(sent({ endDate: new Date(2024, 2, 1, 0, 0, 0, 0) })).toEqual({
      endDate: '2024-03-01',
    });
  });

  it('keeps a date carrying a real time as a date', () => {
    const withTime = new Date(2024, 2, 1, 13, 45, 0, 0);

    expect(sent({ startDate: withTime })).toEqual({ startDate: withTime });
  });

  it('leaves any other parameter untouched, even a date', () => {
    const other = new Date(2024, 2, 1, 0, 0, 0, 0);

    expect(sent({ someOtherDate: other })).toEqual({ someOtherDate: other });
  });

  it('leaves an invalid date alone rather than formatting nonsense', () => {
    const broken = new Date('nonsense');

    expect(sent({ startDate: broken })).toEqual({ startDate: broken });
  });

  it('leaves a parameter that is not a date at all alone', () => {
    expect(sent({ startDate: 'already-a-string' })).toEqual({
      startDate: 'already-a-string',
    });
  });

  it('copies the parameters rather than rewriting the caller object', () => {
    const params = { startDate: new Date(2024, 2, 1, 0, 0, 0, 0) };

    sent(params);

    expect(params.startDate).toBeInstanceOf(Date);
  });

  it('passes through when there are no parameters at all', () => {
    expect(
      dateSanitizerInterceptor({} as InternalAxiosRequestConfig).params,
    ).toBeUndefined();
  });
});
