import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { UserIdentity } from './auth.identity';
import { UserLevel, getUserLevelFromString } from './auth.level';
import { SESSION_COOKIE, readCookie } from './session-cookie';
import { SessionService } from './session.service';
import { TechnicianService } from './technician.service';

export const AuthLevel = (level: UserLevel) => SetMetadata('level', level);

type AuthedRequest = Request & { user?: UserIdentity };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(protected readonly sessions: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = readCookie(req, SESSION_COOKIE);
    const user = token ? await this.sessions.resolve(token) : null;
    if (!user) throw new UnauthorizedException();
    req.user = user;
    return true;
  }
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly sessions: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = readCookie(req, SESSION_COOKIE);
    const user = token ? await this.sessions.resolve(token) : null;
    req.user = user ?? undefined;
    return true;
  }
}

@Injectable()
export class RolesGuard extends AuthGuard {
  constructor(
    sessions: SessionService,
    private readonly reflector: Reflector,
  ) {
    super(sessions);
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!(await super.canActivate(context))) return false;

    const requiredLevel =
      this.reflector.get<UserLevel>('level', context.getHandler()) ??
      this.reflector.get<UserLevel>('level', context.getClass());

    if (requiredLevel === undefined) return true;

    const user = context.switchToHttp().getRequest<AuthedRequest>().user!;
    const level = getUserLevelFromString(user.level);

    if (level === undefined || level < requiredLevel) {
      throw new ForbiddenException('Insufficient level');
    }

    return true;
  }
}

@Injectable()
export class TechnicianGuard extends AuthGuard {
  constructor(
    sessions: SessionService,
    private readonly technicians: TechnicianService,
  ) {
    super(sessions);
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!(await super.canActivate(context))) return false;

    const user = context.switchToHttp().getRequest<AuthedRequest>().user!;

    if (this.technicians.isTechnician(user.userId)) return true;
    throw new ForbiddenException('Insufficient level');
  }
}
