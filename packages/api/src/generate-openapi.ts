import { NestFactory } from '@nestjs/core';
import { writeFileSync } from 'fs';
import path from 'path';
import 'reflect-metadata';

import { AppModule } from './app/app.module';
import { DocsModule } from './app/docs.module';

const TARGET = path.join(__dirname, '..', '..', 'web', 'api.json');

async function generate() {
  process.env['TZ'] = 'UTC';

  // Preview mode reads the decorators without instantiating providers, so the
  // spec comes out without a database connection or a job scheduler running.
  const app = await NestFactory.create(AppModule, {
    preview: true,
    logger: false,
  });

  writeFileSync(TARGET, JSON.stringify(DocsModule.createDocument(app)));

  await app.close();
}

generate();
