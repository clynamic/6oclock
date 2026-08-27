export const STATIC_HOST = 'https://static1.e621.net';

export const PROXY_BASE = '/api/proxy';

/**
 * Rewrites an upstream media URL to route through the proxy, so images load
 * same-origin. Returns the input unchanged when it does not parse.
 */
export const proxiedUrl = (url: string): string => {
  const parsed = URL.parse(url);
  if (!parsed) return url;
  return `${PROXY_BASE}${parsed.pathname}${parsed.search}`;
};
