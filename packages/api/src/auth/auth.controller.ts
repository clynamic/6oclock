import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiCookieAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import { createHash, randomBytes } from 'node:crypto';
import { open, seal } from 'src/common/secret-cipher';

import { AppConfigKeys } from '../app/config.module';
import { MeResponse } from './auth.dto';
import { AuthGuard } from './auth.guard';
import { UserIdentity } from './auth.identity';
import { OidcService } from './oidc.service';
import { OAUTH_COOKIE, SESSION_COOKIE, readCookie } from './session-cookie';
import { SessionService } from './session.service';
import { TechnicianService } from './technician.service';

const OAUTH_TTL_MS = 10 * 60 * 1000;
const SESSION_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

interface OauthState {
  state: string;
  verifier: string;
  exp: number;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly secureCookies: boolean;
  private readonly postLoginUrl: string;

  constructor(
    config: ConfigService,
    private readonly oidc: OidcService,
    private readonly sessions: SessionService,
    private readonly technicians: TechnicianService,
  ) {
    this.secureCookies =
      config.get<string>(AppConfigKeys.COOKIE_SECURE, 'true') !== 'false';
    this.postLoginUrl = config.get<string>(
      AppConfigKeys.APP_POST_LOGIN_URL,
      '/',
    );
  }

  private cookie(extra: Partial<CookieOptions>): CookieOptions {
    return {
      httpOnly: true,
      secure: this.secureCookies,
      sameSite: 'lax',
      ...extra,
    };
  }

  @Get('login')
  @ApiExcludeEndpoint()
  login(@Res() res: Response): void {
    const verifier = randomBytes(32).toString('base64url');
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    const state = randomBytes(16).toString('base64url');
    const payload: OauthState = {
      state,
      verifier,
      exp: Date.now() + OAUTH_TTL_MS,
    };
    res.cookie(
      OAUTH_COOKIE,
      seal(JSON.stringify(payload)),
      this.cookie({ maxAge: OAUTH_TTL_MS, path: '/api/auth' }),
    );
    res.redirect(this.oidc.authorizeUrl(state, challenge));
  }

  @Get('callback')
  @ApiExcludeEndpoint()
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const raw = readCookie(req, OAUTH_COOKIE);
    res.clearCookie(OAUTH_COOKIE, { path: '/api/auth' });
    if (!raw || !code || !state)
      throw new UnauthorizedException('bad callback');

    let parsed: OauthState;
    try {
      parsed = JSON.parse(open(raw)) as OauthState;
    } catch {
      throw new UnauthorizedException('bad oauth state');
    }
    if (parsed.exp < Date.now() || parsed.state !== state) {
      throw new UnauthorizedException('oauth state mismatch');
    }

    const tokens = await this.oidc.exchangeCode(code, parsed.verifier);
    const profile = await this.oidc.profile(tokens.accessToken);
    if (!profile) throw new UnauthorizedException('userinfo failed');

    const identity: UserIdentity = {
      userId: parseInt(profile.sub, 10),
      username: profile.username ?? profile.sub,
      level: profile.level ?? '',
    };
    const sessionToken = await this.sessions.create(identity, tokens);
    res.cookie(
      SESSION_COOKIE,
      sessionToken,
      this.cookie({ maxAge: SESSION_COOKIE_MAX_AGE_MS, path: '/' }),
    );
    // A server redirect here stays inside the consent form's submission chain,
    // which e621 scopes to the redirect_uri origin; hand off to the app with a
    // fresh client navigation instead so form-action does not block it.
    const target = JSON.stringify(this.postLoginUrl).replace(/</g, '\\u003c');
    res
      .status(200)
      .type('html')
      .send(
        `<!doctype html><meta charset="utf-8"><title>Signing in</title>` +
          `<script>location.replace(${target})</script>`,
      );
  }

  @Post('logout')
  @ApiExcludeEndpoint()
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const token = readCookie(req, SESSION_COOKIE);
    if (token) await this.sessions.destroy(token);
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.status(204).end();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Current user',
    description: 'Identity of the currently authenticated user',
    operationId: 'getMe',
  })
  @ApiResponse({ status: 200, description: 'Current user', type: MeResponse })
  me(@Req() req: { user: UserIdentity }): MeResponse {
    return new MeResponse(req.user);
  }

  @Get('is-technician')
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Check if the current user is a technician',
    description: 'Check if the current user is a technician',
    operationId: 'isTechnician',
  })
  @ApiResponse({
    status: 200,
    description: 'Whether the user is a technician',
    type: Boolean,
  })
  isTechnician(@Req() req: { user: UserIdentity }): boolean {
    return this.technicians.isTechnician(req.user.userId);
  }
}
