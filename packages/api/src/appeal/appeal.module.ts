import { Module } from '@nestjs/common';

import { AppealSyncModule } from './sync/appeal-sync.module';

@Module({
  imports: [AppealSyncModule],
})
export class AppealModule {}
