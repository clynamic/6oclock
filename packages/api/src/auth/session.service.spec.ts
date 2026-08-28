import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { seal } from 'src/common/secret-cipher';

import { OidcGrantError, OidcService } from './oidc.service';
import { SessionEntity } from './session.entity';
import { SessionService } from './session.service';

const FALLBACK_ACCESS_TTL_MS = 15 * 60 * 1000;

const settle = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

const session = (partial: Partial<SessionEntity> = {}): SessionEntity =>
  ({
    token: 'a-token',
    userId: 500,
    username: 'someone',
    level: 'Janitor',
    refreshToken: null,
    accessTtlMs: null,
    standingCheckedAt: new Date('2026-01-01T00:00:00Z'),
    expiresAt: new Date('2026-12-01T00:00:00Z'),
    ...partial,
  }) as SessionEntity;

describe('SessionService', () => {
  let service: SessionService;
  let findOne: jest.Mock;
  let insert: jest.Mock;
  let remove: jest.Mock;
  let update: jest.Mock;
  let refresh: jest.Mock;
  let profile: jest.Mock;
  let dataDir: string;
  let sealedToken: string;

  beforeEach(async () => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'session-service-'));
    process.env['DATA_DIR'] = dataDir;
    sealedToken = seal('a-refresh-token');

    findOne = jest.fn().mockResolvedValue(null);
    insert = jest.fn().mockResolvedValue(undefined);
    remove = jest.fn().mockResolvedValue(undefined);
    update = jest.fn().mockResolvedValue({ affected: 1 });
    refresh = jest.fn();
    profile = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: getRepositoryToken(SessionEntity),
          useValue: { findOne, insert, delete: remove, update },
        },
        { provide: OidcService, useValue: { refresh, profile } },
      ],
    }).compile();

    service = moduleRef.get(SessionService);
  });

  afterEach(() => {
    delete process.env['DATA_DIR'];
    fs.rmSync(dataDir, { recursive: true, force: true });
    jest.useRealTimers();
  });

  describe('resolve', () => {
    it('returns nothing for a token it has never seen', async () => {
      expect(await service.resolve('missing')).toBeNull();
      expect(remove).not.toHaveBeenCalled();
    });

    it('deletes an expired session and admits nobody', async () => {
      findOne.mockResolvedValue(
        session({ expiresAt: new Date('2020-01-01T00:00:00Z') }),
      );

      expect(await service.resolve('a-token')).toBeNull();
      expect(remove).toHaveBeenCalledWith({ token: 'a-token' });
    });

    it('hands back the identity a live session carries', async () => {
      findOne.mockResolvedValue(session());

      expect(await service.resolve('a-token')).toEqual({
        userId: 500,
        username: 'someone',
        level: 'Janitor',
      });
    });
  });

  describe('refreshStanding', () => {
    const resolveAndSettle = async (
      stored: Partial<SessionEntity>,
    ): Promise<void> => {
      findOne.mockResolvedValue(session(stored));
      await service.resolve('a-token');
      await settle();
    };

    it('leaves a session alone while its standing was checked recently', async () => {
      await resolveAndSettle({
        refreshToken: sealedToken,
        standingCheckedAt: new Date(Date.now() - 60 * 1000),
      });

      expect(update).not.toHaveBeenCalled();
      expect(refresh).not.toHaveBeenCalled();
    });

    it('rechecks once the access token lifetime has run out', async () => {
      refresh.mockRejectedValue(new OidcGrantError(false));

      await resolveAndSettle({
        refreshToken: sealedToken,
        standingCheckedAt: new Date(Date.now() - FALLBACK_ACCESS_TTL_MS - 1000),
      });

      expect(refresh).toHaveBeenCalled();
    });

    it('never rechecks a session carrying no refresh token', async () => {
      await resolveAndSettle({
        refreshToken: null,
        standingCheckedAt: new Date('2020-01-01T00:00:00Z'),
      });

      expect(update).not.toHaveBeenCalled();
      expect(refresh).not.toHaveBeenCalled();
    });

    it('claims the recheck against the timestamp it read, so two requests cannot both spend the token', async () => {
      const checkedAt = new Date('2020-01-01T00:00:00Z');
      refresh.mockRejectedValue(new OidcGrantError(false));

      await resolveAndSettle({
        refreshToken: sealedToken,
        standingCheckedAt: checkedAt,
      });

      expect(update.mock.calls[0]![0]).toEqual({
        token: 'a-token',
        standingCheckedAt: checkedAt,
      });
    });

    it('gives up the recheck when another request claimed it first', async () => {
      update.mockResolvedValue({ affected: 0 });

      await resolveAndSettle({
        refreshToken: sealedToken,
        standingCheckedAt: new Date('2020-01-01T00:00:00Z'),
      });

      expect(refresh).not.toHaveBeenCalled();
    });

    it('deletes the session when the grant is definitively rejected', async () => {
      refresh.mockRejectedValue(new OidcGrantError(true));

      await resolveAndSettle({
        refreshToken: sealedToken,
        standingCheckedAt: new Date('2020-01-01T00:00:00Z'),
      });

      expect(remove).toHaveBeenCalledWith({ token: 'a-token' });
    });

    it('keeps the session when the token endpoint is merely unreachable', async () => {
      refresh.mockRejectedValue(new OidcGrantError(false));

      await resolveAndSettle({
        refreshToken: sealedToken,
        standingCheckedAt: new Date('2020-01-01T00:00:00Z'),
      });

      expect(remove).not.toHaveBeenCalled();
    });

    it('keeps the session when the refresh throws something unrelated', async () => {
      refresh.mockRejectedValue(new Error('parse failure'));

      await resolveAndSettle({
        refreshToken: sealedToken,
        standingCheckedAt: new Date('2020-01-01T00:00:00Z'),
      });

      expect(remove).not.toHaveBeenCalled();
    });

    it('writes the fresh username and level back onto the session', async () => {
      refresh.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'rotated',
        expiresIn: 3600,
      });
      profile.mockResolvedValue({
        sub: '500',
        username: 'renamed',
        level: 'Moderator',
      });

      await resolveAndSettle({
        refreshToken: sealedToken,
        standingCheckedAt: new Date('2020-01-01T00:00:00Z'),
      });

      expect(update.mock.calls[1]![1]).toMatchObject({
        username: 'renamed',
        level: 'Moderator',
        accessTtlMs: 3600 * 1000,
      });
    });

    it('leaves the stored name alone when the profile carries none', async () => {
      refresh.mockResolvedValue({
        accessToken: 'access',
        refreshToken: null,
        expiresIn: null,
      });
      profile.mockResolvedValue({ sub: '500', username: null, level: null });

      await resolveAndSettle({
        refreshToken: sealedToken,
        standingCheckedAt: new Date('2020-01-01T00:00:00Z'),
      });

      expect(update.mock.calls[1]![1]).not.toHaveProperty('username');
      expect(update.mock.calls[1]![1]).not.toHaveProperty('level');
    });

    it('keeps the old refresh token when the endpoint rotates nothing', async () => {
      refresh.mockResolvedValue({
        accessToken: 'access',
        refreshToken: null,
        expiresIn: null,
      });
      profile.mockResolvedValue(null);

      await resolveAndSettle({
        refreshToken: sealedToken,
        standingCheckedAt: new Date('2020-01-01T00:00:00Z'),
      });

      expect(update.mock.calls[1]![1]).toMatchObject({
        refreshToken: sealedToken,
      });
    });
  });

  describe('create', () => {
    it('mints a long random token and stores the refresh token sealed', async () => {
      const token = await service.create(
        { userId: 500, username: 'someone', level: 'Janitor' },
        { accessToken: 'access', refreshToken: 'secret', expiresIn: 3600 },
      );

      const stored = insert.mock.calls[0]![0] as SessionEntity;

      expect(token).toHaveLength(43);
      expect(stored.token).toBe(token);
      expect(stored.refreshToken).not.toContain('secret');
      expect(stored.accessTtlMs).toBe(3600 * 1000);
    });

    it('mints a different token every time', async () => {
      const identity = {
        userId: 500,
        username: 'someone',
        level: 'Janitor',
      };
      const tokens = {
        accessToken: 'access',
        refreshToken: null,
        expiresIn: null,
      };

      expect(await service.create(identity, tokens)).not.toBe(
        await service.create(identity, tokens),
      );
    });
  });

  describe('purgeExpired', () => {
    it('deletes every session already past its expiry', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-06-01T12:00:00Z'));

      await service.purgeExpired();

      const where = remove.mock.calls[0]![0] as {
        expiresAt: { type: string; value: Date };
      };

      expect(where.expiresAt.type).toBe('lessThanOrEqual');
      expect(where.expiresAt.value.getTime()).toBe(
        new Date('2026-06-01T12:00:00Z').getTime(),
      );
    });
  });
});
