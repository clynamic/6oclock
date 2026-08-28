import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';
import 'reflect-metadata';

import { AppModule } from './app/app.module';
import { JobDiscoveryService } from './job/job.discovery';

// A handler holding the event loop blocks its whole process.
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

  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(PinoLogger));
  app.enableShutdownHooks();

  await app.get(JobDiscoveryService).startWorking();
}
bootstrap();
