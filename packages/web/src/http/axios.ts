import Axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { dateDeserializeInterceptor, dateSanitizerInterceptor } from './date';

export const baseURL = import.meta.env.VITE_API_URL || '/api';

export const AUTH_EXPIRED_EVENT = 'auth:expired';

export const AXIOS_INSTANCE = Axios.create({ baseURL, withCredentials: true });

AXIOS_INSTANCE.interceptors.request.use(dateSanitizerInterceptor);
AXIOS_INSTANCE.interceptors.response.use(dateDeserializeInterceptor);
AXIOS_INSTANCE.interceptors.response.use(undefined, (error: AxiosError) => {
  if (error.response?.status === 401) {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
  return Promise.reject(error);
});

export const makeRequest = <T>(config: AxiosRequestConfig): Promise<T> =>
  AXIOS_INSTANCE.request<T>(config).then((response) => response.data);

export type ErrorType<Error> = AxiosError<Error>;
