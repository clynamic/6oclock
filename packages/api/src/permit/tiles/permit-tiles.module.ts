import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { JobModule } from 'src/job/job.module';
import { ManifestEntity } from 'src/manifest/manifest.entity';

import { PermitEntity } from '../permit.entity';
import { PermitTilesEntity } from './permit-tiles.entity';
import { PermitTilesService } from './permit-tiles.service';
import { PermitTilesWorker } from './permit-tiles.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermitTilesEntity, PermitEntity, ManifestEntity]),
    AuthModule,
    JobModule,
  ],
  providers: [PermitTilesService, PermitTilesWorker],
  exports: [PermitTilesService],
})
export class PermitTilesModule {}
