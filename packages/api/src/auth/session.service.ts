import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { open, seal } from 'src/common/secret-cipher';
import { LessThanOrEqual, Repository } from 'typeorm';

import { UserIdentity } from './auth.identity';
import { OidcGrantError, OidcService, OidcTokens } from './oidc.service';
import { SessionEntity } from './session.entity';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const FALLBACK_ACCESS_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessions: Repository<SessionEntity>,
    private readonly oidc: OidcService,
  ) {}

  async create(identity: UserIdentity, tokens: OidcTokens): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    await this.sessions.insert({
      token,
      userId: identity.userId,
      username: identity.username,
      level: identity.level,
      refreshToken: tokens.refreshToken ? seal(tokens.refreshToken) : null,
      accessTtlMs: tokens.expiresIn ? tokens.expiresIn * 1000 : null,
      standingCheckedAt: new Date(),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });
    return token;
  }

  async resolve(token: string): Promise<UserIdentity | null> {
    const session = await this.sessions.findOne({ where: { token } });
    if (!session) return null;
    if (session.expiresAt.getTime() <= Date.now()) {
      await this.sessions.delete({ token });
      return null;
    }
    void this.refreshStanding(session);
    return {
      userId: session.userId,
      username: session.username,
      level: session.level,
    };
  }

  async destroy(token: string): Promise<void> {
    await this.sessions.delete({ token });
  }

  async purgeExpired(): Promise<void> {
    await this.sessions.delete({ expiresAt: LessThanOrEqual(new Date()) });
  }

  private async refreshStanding(session: SessionEntity): Promise<void> {
    const interval = session.accessTtlMs ?? FALLBACK_ACCESS_TTL_MS;
    const checked = session.standingCheckedAt?.getTime() ?? 0;
    if (Date.now() - checked < interval) return;
    if (!session.refreshToken) return;

    // Claim the refresh with a compare-and-set on standingCheckedAt so concurrent
    // requests do not each spend the rotating single-use refresh token and race
    // one into an invalid_grant that would kill a live session.
    const claim = await this.sessions.update(
      { token: session.token, standingCheckedAt: session.standingCheckedAt! },
      { standingCheckedAt: new Date() },
    );
    if (!claim.affected) return;

    try {
      const tokens = await this.oidc.refresh(open(session.refreshToken));
      const profile = await this.oidc.profile(tokens.accessToken);
      await this.sessions.update(
        { token: session.token },
        {
          refreshToken: tokens.refreshToken
            ? seal(tokens.refreshToken)
            : session.refreshToken,
          accessTtlMs: tokens.expiresIn
            ? tokens.expiresIn * 1000
            : session.accessTtlMs,
          expiresAt: new Date(Date.now() + SESSION_TTL_MS),
          ...(profile?.username ? { username: profile.username } : {}),
          ...(profile?.level ? { level: profile.level } : {}),
        },
      );
    } catch (err) {
      if (err instanceof OidcGrantError && err.dead) {
        await this.sessions.delete({ token: session.token });
      }
    }
  }
}
