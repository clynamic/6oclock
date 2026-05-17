import { AxiosResponse } from 'axios';

export const getContentType = (
  response: AxiosResponse,
): string | undefined => {
  const value = response.headers['content-type'];
  return typeof value === 'string' ? value : undefined;
};
