import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';

import { AppModule } from './app/app.module';
import { CorsConfigModule } from './app/cors.module';
import { DocsModule } from './app/docs.module';
import { AppLogger, RequestLogger } from './app/logger.service';

async function bootstrap() {
  process.env['TZ'] = 'UTC';

  const app = await NestFactory.create(AppModule, {
    logger: new AppLogger(),
  });
  const corsConfig = app.get(CorsConfigModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new RequestLogger());

  DocsModule.setupSwagger(app);

  app.enableCors(corsConfig.createCorsOptions());

  const port = configService.get<number>('PORT', 34571);
  await app.listen(port);
}
bootstrap();
