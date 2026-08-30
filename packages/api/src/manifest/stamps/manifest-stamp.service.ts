import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import { ManifestEntity } from '../manifest.entity';
import { ManifestStampEntity } from './manifest-stamp.entity';

@Injectable()
export class ManifestStampService {
  constructor(
    @InjectRepository(ManifestStampEntity)
    private readonly stampRepository: Repository<ManifestStampEntity>,
  ) {}

  private nameOf(target: EntityTarget<ObjectLiteral>): string {
    return this.stampRepository.manager.getRepository(target).metadata
      .tableName;
  }

  async pending(
    target: EntityTarget<ObjectLiteral>,
    manifests: ManifestEntity[],
  ): Promise<ManifestEntity[]> {
    if (manifests.length === 0) return [];

    const stamps = await this.stampRepository.find({
      where: { target: this.nameOf(target) },
    });

    const built = new Map(
      stamps.map((stamp) => [stamp.manifestId, stamp.updatedAt]),
    );

    return manifests.filter((manifest) => {
      const at = built.get(manifest.id);
      return !at || manifest.updatedAt > at;
    });
  }

  async stamp(
    target: EntityTarget<ObjectLiteral>,
    manifestIds: number[],
  ): Promise<void> {
    if (manifestIds.length === 0) return;

    await this.stampRepository
      .createQueryBuilder()
      .insert()
      .into(ManifestStampEntity)
      .values(
        manifestIds.map((manifestId) => ({
          target: this.nameOf(target),
          manifestId,
        })),
      )
      .orUpdate(['updated_at'], ['target', 'manifest_id'])
      .execute();
  }
}
