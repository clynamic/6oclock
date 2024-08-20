import axios from "axios";
import { AXIOS_INSTANCE } from "../http";
import { getUser } from "../api";

export interface Credentials {
  username: string;
  password: string;
}

export const checkCredentials = async (
  credentials: Credentials
): Promise<boolean> => {
  setAxiosAuth(credentials);

  try {
    await getUser(credentials.username);
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return false;
    }
    throw error;
  } finally {
    clearAxiosAuth();
  }
};

export const setAxiosAuth = (credentials: Credentials) => {
  AXIOS_INSTANCE.defaults.headers.common["Authorization"] =
    `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
};

export const clearAxiosAuth = () => {
  AXIOS_INSTANCE.defaults.headers.common["Authorization"] = undefined;
};
