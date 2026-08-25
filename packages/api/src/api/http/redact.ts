import { AxiosError, AxiosRequestConfig } from 'axios';

const REDACTED = '[redacted]';

const SENSITIVE_HEADERS = [
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
];

const redactHeaders = (headers: unknown): void => {
  if (!headers || typeof headers !== 'object') return;

  for (const key of Object.keys(headers)) {
    if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      (headers as Record<string, unknown>)[key] = REDACTED;
    }
  }
};

const redactConfig = (config: AxiosRequestConfig | undefined): void => {
  if (!config) return;

  redactHeaders(config.headers);

  if (config.auth) {
    config.auth = { username: REDACTED, password: REDACTED };
  }
};

export const redactErrorInterceptor = (error: unknown): never => {
  if (error instanceof AxiosError) {
    redactConfig(error.config);
    redactConfig(error.response?.config);

    delete error.request;
    if (error.response) delete error.response.request;
  }

  throw error;
};
