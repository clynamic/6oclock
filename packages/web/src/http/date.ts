import { InternalAxiosRequestConfig } from 'axios';
import { AxiosResponse } from 'axios';
import { format, isValid, startOfDay } from 'date-fns';

// year-month-day or full ISO 8601
const dateStringFormat = new RegExp(
  '^[0-9]{4}-[0-9]{2}-[0-9]{2}(T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z?)?$',
);

const isDateString = (value: unknown): boolean =>
  typeof value === 'string' && dateStringFormat.test(value);

const deserializeDates = <T>(body: T): T => {
  if (body === null || (typeof body !== 'object' && typeof body !== 'string'))
    return body;

  if (typeof body === 'string') {
    if (isDateString(body)) return new Date(body) as unknown as T;
    return body;
  }

  if (Array.isArray(body)) return body.map(deserializeDates) as unknown as T;

  for (const key of Object.keys(body)) {
    body[key as keyof typeof body] = deserializeDates(
      body[key as keyof typeof body],
    );
  }

  return body;
};

/**
 * Deserialize dates from string to Date.
 */
export const dateDeserializeInterceptor = (
  response: AxiosResponse,
): AxiosResponse => ({
  ...response,
  data: deserializeDates(response.data),
});

const formatDateParam = (value: unknown): unknown => {
  if (!(value instanceof Date)) return value;
  if (!isValid(value)) return value;

  if (value.getTime() === startOfDay(value).getTime()) {
    return format(value, 'yyyy-MM-dd');
  }

  return value;
};

const sanitizeDateParams = <T>(params: T): T => {
  if (params === null || typeof params !== 'object') return params;

  const result = { ...params } as Record<string, unknown>;

  for (const key of Object.keys(result)) {
    if (key === 'startDate' || key === 'endDate') {
      result[key] = formatDateParam(result[key]);
    }
  }

  return result as T;
};

/**
 * Removes empty time from date params (startDate, endDate)
 * when they match the timezone's start of day.
 */
export const dateSanitizerInterceptor = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => ({
  ...config,
  params: sanitizeDateParams(config.params),
});
