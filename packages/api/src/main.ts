import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import 'reflect-metadata';

import { AppModule } from './app/app.module';
import { CorsConfigModule } from './app/cors.module';
import { DocsModule } from './app/docs.module';
import { AppLogger, RequestLogger } from './app/logger.service';

async function bootstrap() {
  process.env['TZ'] = 'UTC';

  const processLogger = new Logger('Process');
  process.on('unhandledRejection', (reason) => {
    processLogger.error(
      `Unhandled rejection: ${reason instanceof Error ? reason.stack : String(reason)}`,
    );
  });
  process.on('uncaughtException', (err) => {
    processLogger.error(`Uncaught exception: ${err.stack ?? err.message}`);
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new AppLogger(),
  });
  const corsConfig = app.get(CorsConfigModule);
  const configService = app.get(ConfigService);

  // Express 5 defaults to a parser that never builds arrays from `foo[]=`.
  app.set('query parser', 'extended');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new RequestLogger());

  DocsModule.setupSwagger(app);

  app.enableCors(corsConfig.createCorsOptions());

  // In dev the backend is the single origin: it serves /api and proxies
  // everything else to the vite dev server (ws for HMR). Prod serves the built
  // web through StaticModule instead.
  const viteProxy =
    configService.get('NODE_ENV') !== 'production'
      ? createProxyMiddleware({
          target: 'http://127.0.0.1:47823',
          changeOrigin: true,
          ws: true,
          pathFilter: (path) => !path.startsWith('/api'),
        })
      : null;
  if (viteProxy) app.use(viteProxy);

  const port = configService.get<number>('PORT', 34571);
  await app.listen(port);
  if (viteProxy) app.getHttpServer().on('upgrade', viteProxy.upgrade);
}
bootstrap();
