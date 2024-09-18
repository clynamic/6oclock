import { login, validateToken } from '../api';
import { AXIOS_INSTANCE } from '../http';

export interface Credentials {
  username: string;
  password: string;
}

export const getAuthToken = async (
  credentials: Credentials,
): Promise<string> => {
  return await login(credentials);
};

export type AuthTokenCheckResult = 'valid' | 'invalid' | 'error';

export const checkAuthToken = async (
  token: string,
): Promise<AuthTokenCheckResult> => {
  try {
    const result = await validateToken({ token });
    return result ? 'valid' : 'invalid';
  } catch {
    return 'error';
  }
};

export const setAxiosAuth = (token: string) => {
  AXIOS_INSTANCE.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAxiosAuth = () => {
  AXIOS_INSTANCE.defaults.headers.common['Authorization'] = undefined;
};
