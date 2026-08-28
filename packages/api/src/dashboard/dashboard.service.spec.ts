import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';

import { DashboardUpdate } from './dashboard.dto';
import { DashboardEntity, DashboardType } from './dashboard.entity';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let findOne: jest.Mock;
  let save: jest.Mock;
  let remove: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn().mockResolvedValue(null);
    save = jest.fn().mockImplementation((value: unknown) => value);
    remove = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        DashboardService,
        {
          provide: getRepositoryToken(DashboardEntity),
          useValue: { findOne, save, remove },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(DashboardService);
  });

  describe('reading a dashboard', () => {
    it('asks for the one belonging to that account and that type', async () => {
      await service.get(500, DashboardType.janitor);

      expect(findOne).toHaveBeenCalledWith({
        where: { userId: 500, type: DashboardType.janitor },
      });
    });

    it('keeps one account out of another account cached dashboard', async () => {
      findOne.mockResolvedValueOnce({ userId: 500, positions: { xs: [] } });
      findOne.mockResolvedValueOnce({ userId: 501, positions: { sm: [] } });

      const mine = await service.get(500, DashboardType.janitor);
      const theirs = await service.get(501, DashboardType.janitor);

      expect(mine).not.toEqual(theirs);
      expect(theirs!.userId).toBe(501);
    });

    it('keeps one dashboard type out of another type cached entry', async () => {
      findOne.mockResolvedValueOnce({ type: DashboardType.janitor });
      findOne.mockResolvedValueOnce({ type: DashboardType.admin });

      const first = await service.get(500, DashboardType.janitor);
      const second = await service.get(500, DashboardType.admin);

      expect(second!.type).not.toBe(first!.type);
    });

    it('gives back nothing when that account has never saved one', async () => {
      await expect(service.get(500, DashboardType.janitor)).resolves.toBeNull();
    });
  });

  describe('updating a dashboard', () => {
    it('stamps the account and type onto what it writes', async () => {
      await service.update(500, DashboardType.janitor, new DashboardUpdate({}));

      expect(save.mock.calls[0]![0]).toMatchObject({
        userId: 500,
        type: DashboardType.janitor,
      });
    });

    it('fills in an empty layout for every breakpoint when none is given', async () => {
      await service.update(500, DashboardType.janitor, new DashboardUpdate({}));

      expect(save.mock.calls[0]![0].positions).toEqual({
        xs: [],
        sm: [],
        md: [],
        lg: [],
        xl: [],
      });
    });

    it('takes the version the update names over the default', async () => {
      await service.update(
        500,
        DashboardType.janitor,
        new DashboardUpdate({ version: 4 }),
      );

      expect(save.mock.calls[0]![0].version).toBe(4);
    });

    it('starts an update that names no version at version one', async () => {
      await service.update(500, DashboardType.janitor, new DashboardUpdate({}));

      expect(save.mock.calls[0]![0].version).toBe(1);
    });

    describe('characterised, not specified', () => {
      it('replaces the whole layout, so a partial one drops the other breakpoints', async () => {
        await service.update(
          500,
          DashboardType.janitor,
          new DashboardUpdate({ positions: { xs: [] } }),
        );

        expect(save.mock.calls[0]![0].positions).toEqual({ xs: [] });
      });
    });
  });

  describe('deleting a dashboard', () => {
    it('removes the one it found', async () => {
      const stored = { userId: 500, type: DashboardType.janitor };
      findOne.mockResolvedValue(stored);

      await service.delete(500, DashboardType.janitor);

      expect(remove).toHaveBeenCalledWith(stored);
    });

    it('does nothing at all when there is none to delete', async () => {
      await service.delete(500, DashboardType.janitor);

      expect(remove).not.toHaveBeenCalled();
    });
  });
});
