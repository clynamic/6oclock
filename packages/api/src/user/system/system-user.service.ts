import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfigKeys } from 'src/app/config.module';

@Injectable()
export class SystemUserService {
  readonly id: number;

  constructor(config: ConfigService) {
    this.id = config.getOrThrow<number>(AppConfigKeys.E621_SYSTEM_USER_ID);
  }

  isSystem(userId?: number): boolean {
    return userId === this.id;
  }
}
