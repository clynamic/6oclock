import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AppConfigKeys } from 'src/app/config.module';

import { OidcGrantError, OidcService } from './oidc.service';

const settings: Record<string, string> = {
  [AppConfigKeys.OIDC_ISSUER]: 'https://e621.net///',
  [AppConfigKeys.OIDC_CLIENT_ID]: 'a-client',
  [AppConfigKeys.OIDC_CLIENT_SECRET]: 'a-secret',
  [AppConfigKeys.OIDC_REDIRECT_URI]: 'https://six.example/callback',
};

const answers = (status: number, body: unknown = {}): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

describe('OidcService', () => {
  let service: OidcService;
  let fetchMock: jest.Mock;

  beforeEach(async () => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const moduleRef = await Test.createTestingModule({
      providers: [
        OidcService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: (key: string) => settings[key] },
        },
      ],
    }).compile();

    service = moduleRef.get(OidcService);
  });

  describe('authorizeUrl', () => {
    it('strips trailing slashes off the issuer so the path is not doubled', () => {
      expect(service.authorizeUrl('a-state', 'a-challenge')).toContain(
        'https://e621.net/oauth/authorize',
      );
    });

    it('asks for a code with the challenge, and says how it was hashed', () => {
      const url = new URL(service.authorizeUrl('a-state', 'a-challenge'));

      expect(url.searchParams.get('response_type')).toBe('code');
      expect(url.searchParams.get('code_challenge')).toBe('a-challenge');
      expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    });

    it('carries the state back for the caller to check', () => {
      const url = new URL(service.authorizeUrl('a-state', 'a-challenge'));

      expect(url.searchParams.get('state')).toBe('a-state');
      expect(url.searchParams.get('client_id')).toBe('a-client');
      expect(url.searchParams.get('redirect_uri')).toBe(
        'https://six.example/callback',
      );
    });

    it('keeps the client secret out of a url the browser will see', () => {
      expect(service.authorizeUrl('a-state', 'a-challenge')).not.toContain(
        'a-secret',
      );
    });
  });

  describe('which failures kill a session', () => {
    it.each([400, 401])(
      'calls a grant rejected with %s dead, so the session goes',
      async (status) => {
        fetchMock.mockResolvedValue(answers(status));

        const error = await service
          .refresh('a-token')
          .catch((thrown: unknown) => thrown);

        expect(error).toBeInstanceOf(OidcGrantError);
        expect((error as OidcGrantError).dead).toBe(true);
      },
    );

    it.each([403, 429, 500, 502, 503])(
      'calls a %s alive, so the session survives an upstream problem',
      async (status) => {
        fetchMock.mockResolvedValue(answers(status));

        const error = await service
          .refresh('a-token')
          .catch((thrown: unknown) => thrown);

        expect((error as OidcGrantError).dead).toBe(false);
      },
    );

    it('calls a network failure alive rather than a rejection', async () => {
      fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

      const error = await service
        .refresh('a-token')
        .catch((thrown: unknown) => thrown);

      expect(error).toBeInstanceOf(OidcGrantError);
      expect((error as OidcGrantError).dead).toBe(false);
    });
  });

  describe('refresh', () => {
    it('sends the refresh grant with the client credentials', async () => {
      fetchMock.mockResolvedValue(
        answers(200, { access_token: 'access', expires_in: 3600 }),
      );

      await service.refresh('a-refresh-token');

      const body = String(
        (fetchMock.mock.calls[0]![1] as { body: string }).body,
      );

      expect(fetchMock.mock.calls[0]![0]).toBe('https://e621.net/oauth/token');
      expect(body).toContain('grant_type=refresh_token');
      expect(body).toContain('refresh_token=a-refresh-token');
      expect(body).toContain('client_secret=a-secret');
    });

    it('reports an absent refresh token and lifetime as absent', async () => {
      fetchMock.mockResolvedValue(answers(200, { access_token: 'access' }));

      expect(await service.refresh('a-token')).toEqual({
        accessToken: 'access',
        refreshToken: null,
        expiresIn: null,
      });
    });
  });

  describe('profile', () => {
    it('reads the account name and level off the claims', async () => {
      fetchMock.mockResolvedValue(
        answers(200, {
          sub: 500,
          preferred_username: 'someone',
          e621_level_string: 'Janitor',
        }),
      );

      expect(await service.profile('access')).toEqual({
        sub: '500',
        username: 'someone',
        level: 'Janitor',
      });
    });

    it('falls back to the display name when there is no preferred one', async () => {
      fetchMock.mockResolvedValue(
        answers(200, { sub: 500, name: 'Someone Else' }),
      );

      expect((await service.profile('access'))?.username).toBe('Someone Else');
    });

    it('reports no level rather than guessing one', async () => {
      fetchMock.mockResolvedValue(answers(200, { sub: 500 }));

      expect(await service.profile('access')).toEqual({
        sub: '500',
        username: null,
        level: null,
      });
    });

    it('gives back nothing when the claims carry no subject', async () => {
      fetchMock.mockResolvedValue(answers(200, { preferred_username: 'x' }));

      expect(await service.profile('access')).toBeNull();
    });

    it('gives back nothing when the request was refused', async () => {
      fetchMock.mockResolvedValue(answers(401));

      expect(await service.profile('access')).toBeNull();
    });

    it('sends the access token as a bearer credential', async () => {
      fetchMock.mockResolvedValue(answers(200, { sub: 1 }));

      await service.profile('an-access-token');

      const headers = (
        fetchMock.mock.calls[0]![1] as { headers: Record<string, string> }
      ).headers;

      expect(headers['Authorization']).toBe('Bearer an-access-token');
    });
  });
});
