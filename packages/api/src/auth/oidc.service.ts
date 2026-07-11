import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { USER_AGENT } from 'src/common/user-agent';

import { AppConfigKeys } from '../app/config.module';

export interface OidcTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number | null;
}

export interface OidcProfile {
  sub: string;
  username: string | null;
  level: string | null;
}

// `dead` marks a definitive invalid_grant (ban, revoke, expiry), as opposed to a
// transient token-endpoint failure. Only a dead grant ends a session.
export class OidcGrantError extends Error {
  constructor(readonly dead: boolean) {
    super(dead ? 'grant rejected' : 'token endpoint unavailable');
  }
}

@Injectable()
export class OidcService {
  private readonly issuer: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(config: ConfigService) {
    this.issuer = config
      .getOrThrow<string>(AppConfigKeys.OIDC_ISSUER)
      .replace(/\/+$/, '');
    this.clientId = config.getOrThrow<string>(AppConfigKeys.OIDC_CLIENT_ID);
    this.clientSecret = config.getOrThrow<string>(
      AppConfigKeys.OIDC_CLIENT_SECRET,
    );
    this.redirectUri = config.getOrThrow<string>(
      AppConfigKeys.OIDC_REDIRECT_URI,
    );
  }

  authorizeUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid profile',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    return `${this.issuer}/oauth/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string, codeVerifier: string): Promise<OidcTokens> {
    return this.tokenRequest({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      code_verifier: codeVerifier,
    });
  }

  async refresh(refreshToken: string): Promise<OidcTokens> {
    return this.tokenRequest({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
  }

  private async tokenRequest(
    fields: Record<string, string>,
  ): Promise<OidcTokens> {
    const body = new URLSearchParams({
      ...fields,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });
    let res: Response;
    try {
      res = await fetch(`${this.issuer}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT,
        },
        body: body.toString(),
      });
    } catch {
      throw new OidcGrantError(false);
    }
    if (!res.ok) {
      throw new OidcGrantError(res.status === 400 || res.status === 401);
    }
    const json = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };
    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token ?? null,
      expiresIn: json.expires_in ?? null,
    };
  }

  async profile(accessToken: string): Promise<OidcProfile | null> {
    const res = await fetch(`${this.issuer}/oauth/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': USER_AGENT,
      },
    });
    if (!res.ok) return null;
    const claims = (await res.json()) as {
      sub?: string | number;
      preferred_username?: string;
      name?: string;
      e621_level_string?: string;
    };
    if (claims.sub == null) return null;
    return {
      sub: String(claims.sub),
      username: claims.preferred_username ?? claims.name ?? null,
      level: claims.e621_level_string ?? null,
    };
  }
}
