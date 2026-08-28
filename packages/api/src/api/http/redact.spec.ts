import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { inspect } from 'util';

import { redactErrorInterceptor } from './redact';

const SECRET = 'Basic c2VjcmV0OmtleQ==';

const failureWith = (
  config: AxiosRequestConfig,
  response?: Partial<AxiosResponse>,
): AxiosError => {
  const error = new AxiosError(
    'Request failed',
    AxiosError.ERR_BAD_REQUEST,
    config as never,
    { socket: 'a live handle' },
    response as AxiosResponse | undefined,
  );
  return error;
};

const thrownBy = (error: unknown): unknown => {
  try {
    redactErrorInterceptor(error);
  } catch (thrown) {
    return thrown;
  }
  throw new Error('the interceptor returned rather than rethrowing');
};

describe('redactErrorInterceptor', () => {
  it('rethrows what it was given, since it is an error interceptor', () => {
    const error = failureWith({ headers: {} });

    expect(thrownBy(error)).toBe(error);
  });

  it('rethrows an error that did not come from axios, untouched', () => {
    const error = new Error('something else');
    const before = Object.getOwnPropertyNames(error).sort();

    expect(thrownBy(error)).toBe(error);
    expect(Object.getOwnPropertyNames(error).sort()).toEqual(before);
  });

  it.each([
    'Authorization',
    'authorization',
    'AUTHORIZATION',
    'Proxy-Authorization',
    'Cookie',
    'Set-Cookie',
  ])('redacts the %s header whatever its case', (header) => {
    const error = failureWith({ headers: { [header]: SECRET } });

    thrownBy(error);

    expect(error.config!.headers![header]).toBe('[redacted]');
  });

  it('leaves a header carrying no credential alone', () => {
    const error = failureWith({
      headers: { 'User-Agent': 'sixoclock', Authorization: SECRET },
    });

    thrownBy(error);

    expect(error.config!.headers!['User-Agent']).toBe('sixoclock');
  });

  it('redacts basic auth given as a config object', () => {
    const error = failureWith({
      headers: {},
      auth: { username: 'secret', password: 'key' },
    });

    thrownBy(error);

    expect(error.config!.auth).toEqual({
      username: '[redacted]',
      password: '[redacted]',
    });
  });

  it('redacts the config the response carries as well as the request one', () => {
    const error = failureWith(
      { headers: { Authorization: SECRET } },
      { config: { headers: { Authorization: SECRET } } as never },
    );

    thrownBy(error);

    expect(error.response!.config.headers['Authorization']).toBe('[redacted]');
  });

  it('drops the raw request handle, which carries the headers as sent', () => {
    const error = failureWith({ headers: { Authorization: SECRET } });

    thrownBy(error);

    expect(error.request).toBeUndefined();
  });

  it('drops the raw request handle hanging off the response', () => {
    const error = failureWith(
      { headers: {} },
      {
        request: { socket: 'a live handle' },
        config: { headers: {} } as never,
      },
    );

    thrownBy(error);

    expect(error.response!.request).toBeUndefined();
  });

  it('keeps the credential out of an inspected failure', () => {
    const error = failureWith(
      {
        headers: { Authorization: SECRET },
        auth: { username: SECRET, password: SECRET },
      },
      { config: { headers: { Authorization: SECRET } } as never },
    );

    thrownBy(error);

    expect(inspect(error, { depth: null })).not.toContain(SECRET);
  });

  it('keeps the credential out of a serialised failure', () => {
    const error = failureWith(
      { headers: { Authorization: SECRET } },
      { config: { headers: { Authorization: SECRET } } as never },
    );

    thrownBy(error);

    expect(JSON.stringify(error)).not.toContain(SECRET);
  });

  it('survives a failure carrying no config at all', () => {
    const error = new AxiosError('no config');

    expect(thrownBy(error)).toBe(error);
  });
});
