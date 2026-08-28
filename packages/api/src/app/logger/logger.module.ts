import { Module } from '@nestjs/common';
import { Request } from 'express';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';
import prettyStream from 'pino-pretty';
import { UserIdentity } from 'src/auth/auth.identity';

import { getLogFields } from './log.context';
import { logSinkStream } from './log.sink';
import { renderMessage } from './message';

const pretty = process.env['NODE_ENV'] !== 'production';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: [
        {
          // Pino includes host and pid by default, which we don't care for.
          base: null,
          level: process.env['LOG_LEVEL'] ?? (pretty ? 'debug' : 'info'),
          mixin: () => getLogFields(),
          customProps: (req) => ({
            user: (req as Request & { user?: UserIdentity }).user?.username,
          }),
          serializers: {
            req: (req: Request) => ({ method: req.method, url: req.url }),
            res: (res: { statusCode: number }) => ({
              status: res.statusCode,
            }),
          },
          autoLogging: {
            ignore: (req) => !(req.url ?? '').startsWith('/api'),
          },
          customLogLevel: (_req, res, error) =>
            error || res.statusCode >= 500
              ? 'error'
              : res.statusCode >= 400
                ? 'warn'
                : 'info',
        },
        pino.multistream([
          {
            stream: pretty
              ? prettyStream({
                  singleLine: true,
                  translateTime: 'HH:MM:ss.l',
                  messageFormat: (log, key) =>
                    renderMessage(
                      String(log[key] ?? ''),
                      log as Record<string, unknown>,
                    ),
                })
              : pino.destination(1),
            // A stream with no level of its own drops anything below info.
            level: 'trace',
          },
          { stream: logSinkStream(), level: 'trace' },
        ]),
      ],
    }),
  ],
})
export class AppLoggerModule {}
