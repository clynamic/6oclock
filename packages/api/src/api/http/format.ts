import { InternalAxiosRequestConfig } from 'axios';

/**
 * I am gonna be real with you, gang.
 *
 * Having multiple response formats under a single endpoint behind a "mode" query parameter
 * is the possibly worst design for any REST endpoint you could imagine, if you then
 * want to model it inside openapi.
 *
 * And because I don't want to deal with that shit, we lock our entire generated client
 * into the format we want.
 */
export const POST_FORMAT = { format: 'v2', mode: 'extended' } as const;

const FORMATTED_PATHS = [
  /^\/posts\.json$/,
  /^\/posts\/random\.json$/,
  /^\/posts\/\d+\.json$/,
  /^\/posts\/\d+\/(update_iqdb|show_seq|mark_as_translated)\.json$/,
  /^\/post_events\.json$/,
  /^\/favorites\.json$/,
  /^\/popular\.json$/,
];

export const postFormatInterceptor = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const url = config.url ?? '';
  const path = url.startsWith('http')
    ? new URL(url).pathname
    : (url.split('?')[0] ?? '');

  if (!FORMATTED_PATHS.some((pattern) => pattern.test(path))) return config;

  config.params = {
    ...config.params,
    v2: 'true',
    mode: POST_FORMAT.mode,
  };
  return config;
};
