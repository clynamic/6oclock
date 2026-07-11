import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { AppConfigKeys } from 'src/app/config.module';

import { ServiceAccountCredentials, encodeCredentials } from './auth.utils';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  readServiceAccountCredentials = (): ServiceAccountCredentials => ({
    username: this.configService
      .getOrThrow<string>(AppConfigKeys.E621_GLOBAL_USERNAME)
      .trim(),
    password: this.configService
      .getOrThrow<string>(AppConfigKeys.E621_GLOBAL_API_KEY)
      .trim(),
  });

  getServerAxiosConfig = (): AxiosRequestConfig => ({
    headers: {
      Authorization: encodeCredentials(this.readServiceAccountCredentials()),
    },
  });
}
