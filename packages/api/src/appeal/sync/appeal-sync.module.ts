import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManifestModule } from 'src/manifest/manifest.module';
import { UserSyncModule } from 'src/user/sync/user-sync.module';

import { AppealEntity } from '../appeal.entity';
import { AppealSyncService } from './appeal-sync.service';
import { AppealSyncWorker } from './appeal-sync.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppealEntity]),
    ManifestModule,
    UserSyncModule,
  ],
  providers: [AppealSyncService, AppealSyncWorker],
})
export class AppealSyncModule {}
