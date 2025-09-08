import Axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { dateDeserializeInterceptor, dateSanitizerInterceptor } from './date';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const AXIOS_INSTANCE = Axios.create({ baseURL });

AXIOS_INSTANCE.interceptors.request.use(dateSanitizerInterceptor);
AXIOS_INSTANCE.interceptors.response.use(dateDeserializeInterceptor);

export const makeRequest = <T>(config: AxiosRequestConfig): Promise<T> =>
  AXIOS_INSTANCE.request<T>(config).then((response) => response.data);

export type ErrorType<Error> = AxiosError<Error>;
