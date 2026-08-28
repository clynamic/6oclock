import { generateManifestSlices } from 'src/health/manifests/manifest-health.utils';
import { ItemType } from 'src/label/label.entity';
import { Repository } from 'typeorm';

import { constructFirstFromId } from '../common/repository';
import { ManifestEntity, Order } from './manifest.entity';

const at = (iso: string): Date => new Date(iso);

const empty = (): ManifestEntity =>
  new ManifestEntity({
    id: 1,
    type: ItemType.appeals,
    startDate: at('2024-02-01T00:00:00Z'),
    endDate: at('2024-03-01T00:00:00Z'),
    lowerId: null as unknown as number,
    upperId: null as unknown as number,
  });

const claiming = (lowerId: number, upperId: number): ManifestEntity =>
  new ManifestEntity({
    id: 2,
    type: ItemType.appeals,
    startDate: at('2024-01-01T00:00:00Z'),
    endDate: at('2024-02-01T00:00:00Z'),
    lowerId,
    upperId,
  });

describe('what a manifest claiming no ids does to each reader', () => {
  describe('the upstream search string the sync workers build', () => {
    it('asks for no id range at all rather than a broken one', () => {
      expect(empty().idRange.toE621RangeString()).toBe('');
    });

    it('still asks for a range when the manifest claims ids', () => {
      expect(claiming(1, 9).idRange.toE621RangeString()).toBe('1..9');
    });
  });

  describe('the first-from-id lookup that seeds a refresh date', () => {
    it('asks the database for ids at or above nothing, which matches nothing', async () => {
      const findOne = jest.fn().mockResolvedValue(null);
      const repository = { findOne } as unknown as Repository<{ id: number }>;

      await expect(
        constructFirstFromId(repository)(null as unknown as number),
      ).resolves.toBeNull();

      const where = findOne.mock.calls[0]![0].where as {
        id: { value: unknown };
      };

      expect(where.id.value).toBeNull();
    });
  });

  describe('merging an empty manifest with one that claims ids', () => {
    it('keeps the real lower id rather than taking the absent one', () => {
      const real = claiming(1, 9);

      real.extend('start', at('2024-02-01T00:00:00Z'), undefined);

      expect(real.lowerId).toBe(1);
    });

    it('keeps the real upper id rather than taking the absent one', () => {
      const real = claiming(1, 9);

      real.extend('end', at('2024-03-01T00:00:00Z'), undefined);

      expect(real.upperId).toBe(9);
    });

    it('still moves the dates, which are the boundary that matters', () => {
      const real = claiming(1, 9);

      real.extend('end', at('2024-03-01T00:00:00Z'), undefined);

      expect(real.endDate).toEqual(at('2024-03-01T00:00:00Z'));
    });
  });

  describe('an order whose boundary is a date rather than a manifest', () => {
    it('reports no ids, which it already tolerated before any of this', () => {
      const order = new Order({
        lower: at('2024-01-01T00:00:00Z'),
        upper: at('2024-02-01T00:00:00Z'),
      });

      expect(order.lowerId).toBeUndefined();
      expect(order.upperId).toBeUndefined();
      expect(order.idRange.toE621RangeString()).toBe('');
    });
  });

  describe('characterised, not specified', () => {
    it('invents a run of missing ids in the health report', () => {
      const slices = generateManifestSlices({
        allIds: [],
        lowerId: null as unknown as number,
        upperId: null as unknown as number,
      });

      expect(slices).toHaveLength(30);
      expect(
        slices.reduce((sum, slice) => sum + slice.unavailable, 0),
      ).toBeGreaterThan(0);
    });
  });
});
