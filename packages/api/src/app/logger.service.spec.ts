import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { Request } from 'express';
import { firstValueFrom, of, throwError } from 'rxjs';
import { UserIdentity } from 'src/auth/auth.identity';

import { RequestLogger } from './logger.service';

const identity: UserIdentity = {
  userId: 500,
  username: 'someone',
  level: 'Janitor',
};

const contextFor = (
  request: Partial<Request> & { user?: UserIdentity },
  statusCode = 200,
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        method: 'get',
        originalUrl: '/tickets',
        query: {},
        protocol: 'https',
        get: () => 'six.example',
        headers: {},
        socket: { remoteAddress: '10.0.0.1' },
        ...request,
      }),
      getResponse: () => ({ statusCode }),
    }),
  }) as unknown as ExecutionContext;

const handlerOf = (source: CallHandler['handle']): CallHandler =>
  ({ handle: source }) as CallHandler;

describe('RequestLogger', () => {
  let interceptor: RequestLogger;
  let log: jest.SpyInstance;
  let warn: jest.SpyInstance;
  let error: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new RequestLogger();
    log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    error = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const run = async (
    context: ExecutionContext,
    handler: CallHandler,
  ): Promise<unknown> =>
    firstValueFrom(interceptor.intercept(context, handler));

  const lines = (spy: jest.SpyInstance): string[] =>
    spy.mock.calls.map((call) => String(call[0]));

  describe('naming who asked', () => {
    it('names an authenticated caller by their account', async () => {
      await run(
        contextFor({ user: identity }),
        handlerOf(() => of('ok')),
      );

      expect(lines(log)[0]).toContain('someone@');
    });

    it('names a caller carrying no session anonymous', async () => {
      await run(
        contextFor({}),
        handlerOf(() => of('ok')),
      );

      expect(lines(log)[0]).toContain('anonymous@');
    });
  });

  describe('naming where it came from', () => {
    it('takes the forwarded address when a proxy sets one', async () => {
      await run(
        contextFor({ headers: { 'x-forwarded-for': '203.0.113.5' } }),
        handlerOf(() => of('ok')),
      );

      expect(lines(log)[0]).toContain('203.0.113.5');
    });

    it('falls back to the socket address when nothing is forwarded', async () => {
      await run(
        contextFor({}),
        handlerOf(() => of('ok')),
      );

      expect(lines(log)[0]).toContain('10.0.0.1');
    });
  });

  describe('a request that succeeds', () => {
    it('logs it arriving and logs it leaving', async () => {
      await run(
        contextFor({}),
        handlerOf(() => of('ok')),
      );

      expect(log).toHaveBeenCalledTimes(2);
    });

    it('reports the status the response carried', async () => {
      await run(
        contextFor({}, 204),
        handlerOf(() => of('ok')),
      );

      expect(lines(log)[1]).toContain('204');
    });

    it('passes the response through untouched', async () => {
      await expect(
        run(
          contextFor({}),
          handlerOf(() => of('a body')),
        ),
      ).resolves.toBe('a body');
    });
  });

  describe('a request that fails', () => {
    const failing = (status?: number): CallHandler =>
      handlerOf(() =>
        throwError(() => Object.assign(new Error('it broke'), { status })),
      );

    it.each([400, 401, 403, 404, 429])(
      'calls a %s the caller fault, so it only warns',
      async (status) => {
        await expect(run(contextFor({}), failing(status))).rejects.toThrow(
          'it broke',
        );

        expect(warn).toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
      },
    );

    it.each([500, 502, 503])(
      'calls a %s our fault, so it raises an error',
      async (status) => {
        await expect(run(contextFor({}), failing(status))).rejects.toThrow(
          'it broke',
        );

        expect(error).toHaveBeenCalled();
        expect(warn).not.toHaveBeenCalled();
      },
    );

    it('treats a failure carrying no status as ours', async () => {
      await expect(run(contextFor({}), failing())).rejects.toThrow('it broke');

      expect(error).toHaveBeenCalled();
    });

    it('rethrows rather than swallowing, so the caller still sees the failure', async () => {
      await expect(run(contextFor({}), failing(500))).rejects.toThrow(
        'it broke',
      );
    });

    it('says what went wrong in the line it logs', async () => {
      await run(contextFor({}), failing(500)).catch(() => undefined);

      expect(lines(error)[0]).toContain('it broke');
    });
  });
});
