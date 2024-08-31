import Axios, { AxiosError, AxiosRequestConfig } from "axios";

import { dateDeserializeInterceptor } from "./date";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: "http://localhost:3000",
});

AXIOS_INSTANCE.interceptors.response.use(dateDeserializeInterceptor);

export const makeRequest = <T>(config: AxiosRequestConfig): Promise<T> =>
  AXIOS_INSTANCE.request<T>(config).then((response) => response.data);

export type ErrorType<Error> = AxiosError<Error>;
