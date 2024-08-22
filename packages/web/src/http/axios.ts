import Axios, { AxiosError, AxiosRequestConfig } from "axios";

import { dateDeserializeInterceptor } from "./date";
import { miscFixInterceptors } from "./misc";
import { objectUnpackInterceptor } from "./unpack";

export const AXIOS_INSTANCE = Axios.create({ baseURL: "https://e621.net" });

AXIOS_INSTANCE.interceptors.response.use(dateDeserializeInterceptor);
AXIOS_INSTANCE.interceptors.response.use(objectUnpackInterceptor);
AXIOS_INSTANCE.interceptors.response.use(miscFixInterceptors);

export const makeRequest = <T>(config: AxiosRequestConfig): Promise<T> =>
  AXIOS_INSTANCE.request<T>(config).then((response) => response.data);

export type ErrorType<Error> = AxiosError<Error>;
