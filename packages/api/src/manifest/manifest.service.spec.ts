import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { startOfDay } from 'date-fns';
import { CacheManager } from 'src/app/browser.module';
import { DateRange, TimeScale } from 'src/common';
import { ItemType } from 'src/label/label.entity';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';

import { ManifestEntity, Order } from './manifest.entity';
import { ManifestService } from './manifest.service';
import { ManifestUtils } from './manifest.utils';

const at = (iso: string): Date => new Date(iso);

const daily = (start: string, end: string): DateRange =>
  new DateRange({
    startDate: at(start),
    endDate: at(end),
    scale: TimeScale.Day,
    timezone: 'UTC',
  });

type Branch = FindOptionsWhere<ManifestEntity> & {
  startDate?: { type: string; value: unknown };
  endDate?: { type: string; value: unknown };
  type?: unknown;
};

describe('ManifestService', () => {
  let service: ManifestService;
  let find: jest.Mock;
  let save: jest.Mock;
  let remove: jest.Mock;

  const branches = (): Branch[] => {
    const options = find.mock.calls[0]![0] as FindManyOptions<ManifestEntity>;
    return options.where as Branch[];
  };

  beforeEach(async () => {
    find = jest.fn().mockResolvedValue([]);
    save = jest.fn().mockImplementation((value: unknown) => value);
    remove = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        ManifestService,
        {
          provide: getRepositoryToken(ManifestEntity),
          useValue: { find, save, remove, findOne: jest.fn() },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(ManifestService);
  });

  describe('finding the manifests that overlap a range', () => {
    it('asks three ways, since a manifest can start in, end in, or swallow the range', async () => {
      await service.list(daily('2024-03-10T00:00:00Z', '2024-03-20T00:00:00Z'));

      expect(branches()).toHaveLength(3);
    });

    it('catches a manifest whose start falls inside the range', async () => {
      await service.list(daily('2024-03-10T00:00:00Z', '2024-03-20T00:00:00Z'));

      expect(branches()[0]!.startDate!.type).toBe('between');
    });

    it('catches a manifest whose end falls inside the range', async () => {
      await service.list(daily('2024-03-10T00:00:00Z', '2024-03-20T00:00:00Z'));

      expect(branches()[1]!.endDate!.type).toBe('between');
    });

    it('catches a manifest that swallows the range from both sides', async () => {
      await service.list(daily('2024-03-10T00:00:00Z', '2024-03-20T00:00:00Z'));

      expect(branches()[2]!.startDate!.type).toBe('lessThan');
      expect(branches()[2]!.endDate!.type).toBe('moreThan');
    });

    it('widens the range by a day at each end before it looks', async () => {
      await service.list(daily('2024-03-10T00:00:00Z', '2024-03-20T00:00:00Z'));

      const between = branches()[0]!.startDate!.value as Date[];

      expect(between[0]).toEqual(at('2024-03-09T00:00:00Z'));
      expect(between[1]).toEqual(at('2024-03-21T00:00:00Z'));
    });

    it('carries the type filter onto every branch, so no other type leaks in', async () => {
      await service.list(
        daily('2024-03-10T00:00:00Z', '2024-03-20T00:00:00Z'),
        { type: [ItemType.tickets] },
      );

      for (const branch of branches()) {
        const filter = branch.type as unknown as {
          type: string;
          value: ItemType[];
        };
        expect(filter.type).toBe('in');
        expect(filter.value).toEqual([ItemType.tickets]);
      }
    });

    it('looks at every manifest when no range narrows it', async () => {
      await service.list();

      expect(branches()).toEqual([{}]);
    });

    it('goes straight to the id when one is named, ignoring the range', async () => {
      await service.list(
        daily('2024-03-10T00:00:00Z', '2024-03-20T00:00:00Z'),
        {
          id: 42,
        },
      );

      expect(find).toHaveBeenCalledWith({ where: { id: 42 } });
    });
  });

  describe('rewriting manifests', () => {
    it('discards before it saves, so a replacement cannot collide with what it replaces', async () => {
      const order: string[] = [];
      remove.mockImplementation(() => {
        order.push('remove');
        return Promise.resolve();
      });
      save.mockImplementation((value: unknown) => {
        order.push('save');
        return Promise.resolve(value);
      });

      const discard = [new ManifestEntity({ id: 1 })];
      const keep = [new ManifestEntity({ id: 2 })];

      await service.rewrite({ discard, save: keep });

      expect(order).toEqual(['remove', 'save']);
    });

    it('hands back what it saved rather than what it discarded', async () => {
      const keep = [new ManifestEntity({ id: 2 })];

      await expect(
        service.rewrite({
          discard: [new ManifestEntity({ id: 1 })],
          save: keep,
        }),
      ).resolves.toBe(keep);
    });

    it('still calls both sides when there is nothing to discard', async () => {
      await service.rewrite({ discard: [], save: [] });

      expect(remove).toHaveBeenCalledWith([]);
      expect(save).toHaveBeenCalledWith([]);
    });
  });

  describe('updating the boundaries of an order', () => {
    it('saves a boundary that is a manifest', async () => {
      const lower = new ManifestEntity({ id: 5 });

      await service.updateOrder(new Order({}), { lower });

      expect(save).toHaveBeenCalledWith(lower);
    });

    it('passes a date boundary through without writing anything', async () => {
      const lower = at('2024-03-01T00:00:00Z');

      const result = await service.updateOrder(new Order({}), { lower });

      expect(save).not.toHaveBeenCalled();
      expect(result.lower).toBe(lower);
    });

    it('carries both boundaries through when the update names both', async () => {
      const lower = at('2024-03-01T00:00:00Z');
      const upper = at('2024-03-09T00:00:00Z');

      const result = await service.updateOrder(new Order({}), { lower, upper });

      expect(result.lower).toBe(lower);
      expect(result.upper).toBe(upper);
    });

    describe('characterised, not specified', () => {
      it('drops the boundary an update leaves out rather than keeping the old one', async () => {
        const upper = at('2024-03-09T00:00:00Z');

        const result = await service.updateOrder(new Order({ upper }), {
          lower: at('2024-03-01T00:00:00Z'),
        });

        expect(result.upper).toBeUndefined();
      });
    });
  });

  describe('asking what is available', () => {
    it('measures availability from the start of today, not the current moment', async () => {
      jest.useFakeTimers().setSystemTime(at('2024-06-15T17:42:31Z'));
      const spy = jest.spyOn(ManifestUtils, 'computeAvailability');

      await service.available(
        daily('2024-06-01T00:00:00Z', '2024-06-10T00:00:00Z'),
        [ItemType.tickets],
      );

      expect(spy.mock.calls[0]![3]).toEqual(
        startOfDay(at('2024-06-15T17:42:31Z')),
      );

      spy.mockRestore();
      jest.useRealTimers();
    });

    it('asks about exactly the types it was given', async () => {
      const spy = jest.spyOn(ManifestUtils, 'computeAvailability');

      await service.available(
        daily('2024-06-01T00:00:00Z', '2024-06-10T00:00:00Z'),
        [ItemType.tickets, ItemType.flags],
      );

      expect(spy.mock.calls[0]![2]).toEqual([ItemType.tickets, ItemType.flags]);

      spy.mockRestore();
    });
  });
});
