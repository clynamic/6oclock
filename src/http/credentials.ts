import { login } from "../api";
import { AXIOS_INSTANCE } from "../http";

export interface Credentials {
  username: string;
  password: string;
}

export const getAuthToken = async (
  credentials: Credentials
): Promise<string> => {
  return await login(credentials);
};

export const checkAuthToken = async (token: string): Promise<boolean> => {
  // TODO!
  return true;
};

export const setAxiosAuth = (token: string) => {
  AXIOS_INSTANCE.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const clearAxiosAuth = () => {
  AXIOS_INSTANCE.defaults.headers.common["Authorization"] = undefined;
};
