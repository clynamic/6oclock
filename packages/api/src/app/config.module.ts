import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

export enum AppConfigKeys {
  PORT = 'PORT',
  E621_GLOBAL_USERNAME = 'E621_GLOBAL_USERNAME',
  E621_GLOBAL_API_KEY = 'E621_GLOBAL_API_KEY',
  E621_SYSTEM_USER_ID = 'E621_SYSTEM_USER_ID',
  CORS_ALLOWED_ORIGINS = 'CORS_ALLOWED_ORIGINS',
  DATA_DIR = 'DATA_DIR',
  TECHNICIANS = 'TECHNICIANS',
  OIDC_ISSUER = 'OIDC_ISSUER',
  OIDC_CLIENT_ID = 'OIDC_CLIENT_ID',
  OIDC_CLIENT_SECRET = 'OIDC_CLIENT_SECRET',
  OIDC_REDIRECT_URI = 'OIDC_REDIRECT_URI',
  APP_POST_LOGIN_URL = 'APP_POST_LOGIN_URL',
  COOKIE_SECURE = 'COOKIE_SECURE',
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validationSchema: Joi.object<Record<AppConfigKeys, Joi.Schema>>({
        PORT: Joi.number().optional().default(34571),
        E621_GLOBAL_USERNAME: Joi.string().required(),
        E621_GLOBAL_API_KEY: Joi.string().required(),
        E621_SYSTEM_USER_ID: Joi.number().optional().default(360277),
        CORS_ALLOWED_ORIGINS: Joi.alternatives()
          .try(Joi.string(), Joi.array().items(Joi.string()))
          .optional()
          .allow(''),
        DATA_DIR: Joi.string().optional().default('./data'),
        TECHNICIANS: Joi.string().optional().default('').allow(''),
        OIDC_ISSUER: Joi.string().optional().default('https://e621.net'),
        OIDC_CLIENT_ID: Joi.string().optional().default('').allow(''),
        OIDC_CLIENT_SECRET: Joi.string().optional().default('').allow(''),
        OIDC_REDIRECT_URI: Joi.string().optional().default('').allow(''),
        APP_POST_LOGIN_URL: Joi.string().optional().default('/'),
        COOKIE_SECURE: Joi.string().optional().default('true'),
      }),
    }),
  ],
})
export class AppConfigModule {}
