import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import {
  AuthGuard,
  OptionalAuthGuard,
  RolesGuard,
  TechnicianGuard,
} from './auth.guard';
import { UserIdentity } from './auth.identity';
import { UserLevel } from './auth.level';
import { SessionService } from './session.service';
import { TechnicianService } from './technician.service';

const identity: UserIdentity = {
  userId: 500,
  username: 'someone',
  level: 'Janitor',
};

type ProbeRequest = Request & { user?: UserIdentity };

const requestWith = (cookie?: string): ProbeRequest =>
  ({ headers: cookie === undefined ? {} : { cookie } }) as ProbeRequest;

const contextFor = (
  request: ProbeRequest,
  handler: () => void = () => undefined,
  target: object = class Probe {},
): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => handler,
    getClass: () => target,
  }) as unknown as ExecutionContext;

const sessions = (resolve: jest.Mock): SessionService =>
  ({ resolve }) as unknown as SessionService;

describe('AuthGuard', () => {
  it('turns away a request carrying no session cookie', async () => {
    const resolve = jest.fn();
    const guard = new AuthGuard(sessions(resolve));

    await expect(
      guard.canActivate(contextFor(requestWith())),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(resolve).not.toHaveBeenCalled();
  });

  it('turns away a session token it cannot resolve', async () => {
    const guard = new AuthGuard(sessions(jest.fn().mockResolvedValue(null)));

    await expect(
      guard.canActivate(contextFor(requestWith('sixoclock_session=stale'))),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('admits a live session and hands the identity to the handler', async () => {
    const guard = new AuthGuard(
      sessions(jest.fn().mockResolvedValue(identity)),
    );
    const request = requestWith('sixoclock_session=live');

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toEqual(identity);
  });
});

describe('OptionalAuthGuard', () => {
  it('admits a request carrying no session at all', async () => {
    const guard = new OptionalAuthGuard(sessions(jest.fn()));
    const request = requestWith();

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('admits a stale token without an identity rather than refusing', async () => {
    const guard = new OptionalAuthGuard(
      sessions(jest.fn().mockResolvedValue(null)),
    );
    const request = requestWith('sixoclock_session=stale');

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('attaches the identity when there is one', async () => {
    const guard = new OptionalAuthGuard(
      sessions(jest.fn().mockResolvedValue(identity)),
    );
    const request = requestWith('sixoclock_session=live');

    await guard.canActivate(contextFor(request));

    expect(request.user).toEqual(identity);
  });
});

describe('RolesGuard', () => {
  const guardFor = (level?: string) =>
    new RolesGuard(
      sessions(
        jest.fn().mockResolvedValue(level ? { ...identity, level } : identity),
      ),
      new Reflector(),
    );

  const handlerRequiring = (level: UserLevel): (() => void) => {
    const handler = (): void => undefined;
    Reflect.defineMetadata('level', level, handler);
    return handler;
  };

  const classRequiring = (level: UserLevel): object => {
    class Probe {}
    Reflect.defineMetadata('level', level, Probe);
    return Probe;
  };

  it('admits anyone through a route that names no level', async () => {
    await expect(
      guardFor('Member').canActivate(
        contextFor(requestWith('sixoclock_session=live')),
      ),
    ).resolves.toBe(true);
  });

  it('admits a level above the one the route asks for', async () => {
    await expect(
      guardFor('Admin').canActivate(
        contextFor(
          requestWith('sixoclock_session=live'),
          handlerRequiring(UserLevel.Janitor),
        ),
      ),
    ).resolves.toBe(true);
  });

  it('admits a level exactly matching the one the route asks for', async () => {
    await expect(
      guardFor('Janitor').canActivate(
        contextFor(
          requestWith('sixoclock_session=live'),
          handlerRequiring(UserLevel.Janitor),
        ),
      ),
    ).resolves.toBe(true);
  });

  it('turns away a level below the one the route asks for', async () => {
    await expect(
      guardFor('Member').canActivate(
        contextFor(
          requestWith('sixoclock_session=live'),
          handlerRequiring(UserLevel.Janitor),
        ),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('turns away a level string it cannot read at all', async () => {
    await expect(
      guardFor('Wizard').canActivate(
        contextFor(
          requestWith('sixoclock_session=live'),
          handlerRequiring(UserLevel.Staff),
        ),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('falls back to the level the controller names', async () => {
    await expect(
      guardFor('Member').canActivate(
        contextFor(
          requestWith('sixoclock_session=live'),
          () => undefined,
          classRequiring(UserLevel.Janitor),
        ),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lets the route override the level its controller names', async () => {
    await expect(
      guardFor('Member').canActivate(
        contextFor(
          requestWith('sixoclock_session=live'),
          handlerRequiring(UserLevel.Member),
          classRequiring(UserLevel.Admin),
        ),
      ),
    ).resolves.toBe(true);
  });

  it('turns away before it ever reads a level, when there is no session', async () => {
    await expect(
      new RolesGuard(
        sessions(jest.fn().mockResolvedValue(null)),
        new Reflector(),
      ).canActivate(
        contextFor(
          requestWith('sixoclock_session=stale'),
          handlerRequiring(UserLevel.Member),
        ),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('TechnicianGuard', () => {
  const guardFor = (isTechnician: boolean) =>
    new TechnicianGuard(sessions(jest.fn().mockResolvedValue(identity)), {
      isTechnician: () => isTechnician,
    } as unknown as TechnicianService);

  it('admits an account on the technician list', async () => {
    await expect(
      guardFor(true).canActivate(
        contextFor(requestWith('sixoclock_session=live')),
      ),
    ).resolves.toBe(true);
  });

  it('turns away an account that is not on it, whatever its level', async () => {
    await expect(
      guardFor(false).canActivate(
        contextFor(requestWith('sixoclock_session=live')),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
