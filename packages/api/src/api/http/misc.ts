import { AxiosResponse } from 'axios';

import { getContentType } from './headers';

export const miscFixInterceptors = (response: AxiosResponse): AxiosResponse => {
  if (!getContentType(response)?.includes('application/json')) {
    return response;
  }

  // e621 is genuinely such a deranged site
  if (response.data && response.data.post) {
    response.data = response.data.post;
  }
  return response;
};
