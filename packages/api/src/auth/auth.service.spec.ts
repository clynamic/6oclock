import { ConfigService } from '@nestjs/config';
import { AppConfigKeys } from 'src/app/config.module';

import { AuthService } from './auth.service';

const holding = (settings: Record<string, string>): AuthService =>
  new AuthService({
    getOrThrow: (key: string) => settings[key],
  } as unknown as ConfigService);

const credentials = {
  [AppConfigKeys.E621_GLOBAL_USERNAME]: 'a-service-account',
  [AppConfigKeys.E621_GLOBAL_API_KEY]: 'a-key',
};

describe('AuthService', () => {
  describe('readServiceAccountCredentials', () => {
    it('reads the account name and key it was configured with', () => {
      expect(holding(credentials).readServiceAccountCredentials()).toEqual({
        username: 'a-service-account',
        password: 'a-key',
      });
    });

    it('trims the account name, since a setting picks up stray whitespace', () => {
      expect(
        holding({
          ...credentials,
          [AppConfigKeys.E621_GLOBAL_USERNAME]: '  a-service-account\n',
        }).readServiceAccountCredentials().username,
      ).toBe('a-service-account');
    });

    it('trims the key too, since a newline there breaks every request', () => {
      expect(
        holding({
          ...credentials,
          [AppConfigKeys.E621_GLOBAL_API_KEY]: 'a-key\n',
        }).readServiceAccountCredentials().password,
      ).toBe('a-key');
    });
  });

  describe('getServerAxiosConfig', () => {
    it('carries the credentials as an authorization header', () => {
      expect(holding(credentials).getServerAxiosConfig().headers).toEqual({
        Authorization: `Basic ${btoa('a-service-account:a-key')}`,
      });
    });

    it('keeps the key out of the config in plain text', () => {
      expect(
        JSON.stringify(holding(credentials).getServerAxiosConfig()),
      ).not.toContain('a-key');
    });

    it('sends the trimmed credentials, not the raw setting', () => {
      const config = holding({
        [AppConfigKeys.E621_GLOBAL_USERNAME]: ' a-service-account ',
        [AppConfigKeys.E621_GLOBAL_API_KEY]: ' a-key ',
      }).getServerAxiosConfig();

      expect(config.headers!['Authorization']).toBe(
        `Basic ${btoa('a-service-account:a-key')}`,
      );
    });
  });
});
