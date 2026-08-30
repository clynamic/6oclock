import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ManifestStampEntity } from './manifest-stamp.entity';
import { ManifestStampService } from './manifest-stamp.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ManifestStampEntity])],
  providers: [ManifestStampService],
  exports: [ManifestStampService],
})
export class ManifestStampModule {}
