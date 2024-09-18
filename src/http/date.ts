import { AxiosResponse } from "axios";

// year-month-day or full ISO 8601
const dateStringFormat = new RegExp(
  "^[0-9]{4}-[0-9]{2}-[0-9]{2}(T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z?)?$"
);

const isDateString = (value: unknown): boolean =>
  typeof value === "string" && dateStringFormat.test(value);

const deserializeDates = <T>(body: T): T => {
  if (body === null || (typeof body !== "object" && typeof body !== "string"))
    return body;

  if (typeof body === "string") {
    if (isDateString(body)) return new Date(body) as unknown as T;
    return body;
  }

  if (Array.isArray(body)) return body.map(deserializeDates) as unknown as T;

  for (const key of Object.keys(body)) {
    body[key as keyof typeof body] = deserializeDates(
      body[key as keyof typeof body]
    );
  }

  return body;
};

/**
 * Deserialize dates from string to Date.
 */
export const dateDeserializeInterceptor = (
  response: AxiosResponse
): AxiosResponse => ({
  ...response,
  data: deserializeDates(response.data),
});
