import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ManifestEntity } from '../manifest.entity';
import { ManifestStampEntity } from './manifest-stamp.entity';
import { ManifestStampService } from './manifest-stamp.service';

const at = (iso: string): Date => new Date(iso);

const updated = (id: number, updatedAt: string): ManifestEntity =>
  new ManifestEntity({ id, updatedAt: at(updatedAt) });

class TargetEntity {}

describe('ManifestStampService', () => {
  let service: ManifestStampService;
  let find: jest.Mock;
  let values: jest.Mock;

  beforeEach(async () => {
    find = jest.fn().mockResolvedValue([]);
    values = jest.fn().mockReturnThis();

    const builder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values,
      orUpdate: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ManifestStampService,
        {
          provide: getRepositoryToken(ManifestStampEntity),
          useValue: {
            find,
            createQueryBuilder: jest.fn().mockReturnValue(builder),
            manager: {
              getRepository: jest
                .fn()
                .mockReturnValue({ metadata: { tableName: 'target_table' } }),
            },
          },
        },
      ],
    }).compile();

    service = moduleRef.get(ManifestStampService);
  });

  describe('choosing what still needs building', () => {
    it('returns a manifest this target has never stamped', async () => {
      const pending = await service.pending(TargetEntity, [
        updated(1, '2024-03-01T00:00:00Z'),
      ]);

      expect(pending.map((manifest) => manifest.id)).toEqual([1]);
    });

    it('returns a manifest updated after its stamp', async () => {
      find.mockResolvedValue([
        new ManifestStampEntity({
          target: 'target_table',
          manifestId: 1,
          updatedAt: at('2024-03-01T00:00:00Z'),
        }),
      ]);

      const pending = await service.pending(TargetEntity, [
        updated(1, '2024-03-02T00:00:00Z'),
      ]);

      expect(pending.map((manifest) => manifest.id)).toEqual([1]);
    });

    it('leaves out a manifest unchanged since its stamp', async () => {
      find.mockResolvedValue([
        new ManifestStampEntity({
          target: 'target_table',
          manifestId: 1,
          updatedAt: at('2024-03-02T00:00:00Z'),
        }),
      ]);

      const pending = await service.pending(TargetEntity, [
        updated(1, '2024-03-01T00:00:00Z'),
      ]);

      expect(pending).toEqual([]);
    });

    it('reads only the stamps of the target it was asked about', async () => {
      await service.pending(TargetEntity, [updated(1, '2024-03-01T00:00:00Z')]);

      expect(find).toHaveBeenCalledWith({ where: { target: 'target_table' } });
    });
  });

  describe('stamping', () => {
    it('writes one row per manifest against the target table name', async () => {
      await service.stamp(TargetEntity, [1, 2]);

      expect(values).toHaveBeenCalledWith([
        { target: 'target_table', manifestId: 1 },
        { target: 'target_table', manifestId: 2 },
      ]);
    });

    it('writes nothing when there is nothing to stamp', async () => {
      await service.stamp(TargetEntity, []);

      expect(values).not.toHaveBeenCalled();
    });
  });
});
