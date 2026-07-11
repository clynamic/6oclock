import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppConfigKeys } from '../app/config.module';

@Injectable()
export class TechnicianService {
  private readonly ids: Set<number>;

  constructor(config: ConfigService) {
    this.ids = new Set(
      config
        .get<string>(AppConfigKeys.TECHNICIANS, '')
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => Number.isInteger(id)),
    );
  }

  isTechnician(userId?: number): boolean {
    return userId !== undefined && this.ids.has(userId);
  }
}
