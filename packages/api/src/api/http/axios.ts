import Axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { USER_AGENT } from 'src/common/user-agent';

import {
  dateDeserializeInterceptor,
  timezoneInjectorInterceptor,
} from './date';
import { emptyResultsErrorInterceptor } from './empty';
import { postFormatInterceptor } from './format';
import {
  logErrorInterceptor,
  logRequestInterceptor,
  logResponseInterceptor,
} from './logs';
import { redactErrorInterceptor } from './redact';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: 'https://e621.net',
  headers: {
    'User-Agent': USER_AGENT,
  },
});

AXIOS_INSTANCE.interceptors.request.use(logRequestInterceptor);

AXIOS_INSTANCE.interceptors.request.use(timezoneInjectorInterceptor);

AXIOS_INSTANCE.interceptors.request.use(postFormatInterceptor);

AXIOS_INSTANCE.interceptors.response.use(null, redactErrorInterceptor);

AXIOS_INSTANCE.interceptors.response.use(dateDeserializeInterceptor);
AXIOS_INSTANCE.interceptors.response.use(null, emptyResultsErrorInterceptor);

AXIOS_INSTANCE.interceptors.response.use(
  logResponseInterceptor,
  logErrorInterceptor,
);

export const makeRequest = <T>(
  config: AxiosRequestConfig,
  requestConfig?: AxiosRequestConfig,
): Promise<T> =>
  AXIOS_INSTANCE.request<T>({
    ...config,
    ...requestConfig,
  }).then((response) => response.data);

export type ErrorType<Error> = AxiosError<Error>;
