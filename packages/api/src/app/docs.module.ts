import { INestApplication, Module } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { description, name, version } from '../../package.json';

@Module({})
export class DocsModule {
  static setupSwagger(app: INestApplication) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(name)
      .setDescription(description)
      .setVersion(version)
      .setExternalDoc('/api/swagger.json', '/api/swagger.json')
      .addBearerAuth()
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, swaggerDocument, {
      jsonDocumentUrl: '/api/swagger.json',
    });
  }
}
