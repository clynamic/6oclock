import { AXIOS_INSTANCE, baseURL } from './axios';

const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect';

export const login = (redirect?: string | null) => {
  if (redirect) {
    sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, redirect);
  }
  window.location.href = `${baseURL}/auth/login`;
};

export const logout = async () => {
  try {
    await AXIOS_INSTANCE.post('/auth/logout');
  } catch {
    // The session is dead server-side regardless; the caller navigates away.
  }
};

export const takePostLoginRedirect = (): string | null => {
  const redirect = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  if (redirect) sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  return redirect;
};
