import { Logger } from '@nestjs/common';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const logger = new Logger('Axios');

export const logRequestInterceptor = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const url = new URL(config.url ?? '', config.baseURL);

  if (config.params) {
    const searchParams = new URLSearchParams(config.params);
    url.search = searchParams.toString();
  }

  const method = config.method?.toUpperCase() ?? '???';

  logger.debug({
    msg: '[{method}] -> {url}',
    method,
    url: url.href,
  });
  return config;
};

export const logResponseInterceptor = (
  response: AxiosResponse,
): AxiosResponse => {
  const { config, status } = response;
  const url = new URL(config.url ?? '', config.baseURL);

  if (config.params) {
    const searchParams = new URLSearchParams(config.params);
    url.search = searchParams.toString();
  }

  const method = config.method?.toUpperCase() ?? '???';

  logger.debug({
    msg: '[{method}] <- {url} : {status}',
    method,
    url: url.href,
    status,
  });
  return response;
};

export const logErrorInterceptor = (error: AxiosError) => {
  if (error instanceof AxiosError && error.response) {
    const { config, status } = error.response;
    const url = new URL(config.url ?? '', config.baseURL);

    if (config.params) {
      const searchParams = new URLSearchParams(config.params);
      url.search = searchParams.toString();
    }

    const method = config.method?.toUpperCase() ?? '???';

    logger.warn({
      msg: '[{method}] <- {url} : {status}',
      method,
      url: url.href,
      status,
    });
  } else if (error instanceof AxiosError && error.config) {
    const { config } = error;
    const url = new URL(config.url ?? '', config.baseURL);

    if (config.params) {
      const searchParams = new URLSearchParams(config.params);
      url.search = searchParams.toString();
    }

    const method = config.method?.toUpperCase() ?? '???';

    logger.error({
      msg: '[{method}] x- {url} : {code}',
      method,
      url: url.href,
      code: error.code,
      err: error,
    });
  } else {
    logger.error({
      msg: 'Request failed: {error}',
      error: error.message,
      code: error.code,
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      err: error,
    });
  }
  return Promise.reject(error);
};
