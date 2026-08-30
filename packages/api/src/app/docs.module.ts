import { INestApplication, Module } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { description, name, version } from '../../package.json';

@Module({})
export class DocsModule {
  static createDocument(app: INestApplication) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(name)
      .setDescription(description)
      .setVersion(version)
      .setExternalDoc('/api/swagger.json', '/api/swagger.json')
      .addBearerAuth()
      .build();

    return SwaggerModule.createDocument(app, swaggerConfig, {
      ignoreGlobalPrefix: true,
    });
  }

  static setupSwagger(app: INestApplication) {
    SwaggerModule.setup('api', app, DocsModule.createDocument(app), {
      jsonDocumentUrl: '/api/swagger.json',
    });
  }
}
