import { ItemType } from 'src/label/label.entity';

import { ManifestEntity, Order } from './manifest.entity';

const at = (iso: string): Date => new Date(iso);

const manifest = (partial: Partial<ManifestEntity>): ManifestEntity =>
  new ManifestEntity({
    id: 1,
    type: ItemType.posts,
    startDate: at('2024-01-01T00:00:00Z'),
    endDate: at('2024-01-31T00:00:00Z'),
    lowerId: 100,
    upperId: 200,
    ...partial,
  });

describe('Order', () => {
  describe('the gap it names', () => {
    it('runs from the end of the lower manifest to the start of the upper one', () => {
      const order = new Order({
        lower: manifest({
          startDate: at('2024-01-01T00:00:00Z'),
          endDate: at('2024-01-10T00:00:00Z'),
        }),
        upper: manifest({
          startDate: at('2024-01-20T00:00:00Z'),
          endDate: at('2024-01-31T00:00:00Z'),
        }),
      });

      expect(order.lowerDate).toEqual(at('2024-01-10T00:00:00Z'));
      expect(order.upperDate).toEqual(at('2024-01-20T00:00:00Z'));
    });

    it('runs from the highest id below to the lowest id above', () => {
      const order = new Order({
        lower: manifest({ lowerId: 100, upperId: 200 }),
        upper: manifest({ lowerId: 900, upperId: 1000 }),
      });

      expect(order.lowerId).toBe(200);
      expect(order.upperId).toBe(900);
    });

    it('opens its date range on the lower bound and closes it on the upper one', () => {
      const order = new Order({
        lower: manifest({ endDate: at('2024-01-10T00:00:00Z') }),
        upper: manifest({ startDate: at('2024-01-20T00:00:00Z') }),
      });

      expect(order.dateRange.startDate).toEqual(at('2024-01-10T00:00:00Z'));
      expect(order.dateRange.endDate).toEqual(at('2024-01-20T00:00:00Z'));
    });

    it('takes a bare date as both ends of that boundary', () => {
      const order = new Order({
        lower: at('2024-01-10T00:00:00Z'),
        upper: at('2024-01-20T00:00:00Z'),
      });

      expect(order.lowerDate).toEqual(at('2024-01-10T00:00:00Z'));
      expect(order.upperDate).toEqual(at('2024-01-20T00:00:00Z'));
    });

    it('leaves the id open where a boundary is a bare date', () => {
      const order = new Order({
        lower: at('2024-01-10T00:00:00Z'),
        upper: manifest({ lowerId: 900 }),
      });

      expect(order.lowerId).toBeUndefined();
      expect(order.upperId).toBe(900);
    });
  });

  describe('inPast', () => {
    it('calls an order settled once its upper bound has passed', () => {
      const order = new Order({
        lower: at('2024-01-10T00:00:00Z'),
        upper: at('2024-01-20T00:00:00Z'),
      });

      expect(order.inPast).toBe(true);
    });

    it('calls an order unsettled while its upper bound is ahead', () => {
      const order = new Order({
        lower: new Date(Date.now() - 1000),
        upper: new Date(Date.now() + 60 * 60 * 1000),
      });

      expect(order.inPast).toBe(false);
    });
  });
});

describe('ManifestEntity.extendWith', () => {
  it('reaches backwards when the other manifest starts earlier', () => {
    const target = manifest({
      startDate: at('2024-02-01T00:00:00Z'),
      endDate: at('2024-02-28T00:00:00Z'),
      lowerId: 500,
      upperId: 600,
    });

    target.extendWith(
      manifest({
        id: 2,
        startDate: at('2024-01-01T00:00:00Z'),
        endDate: at('2024-01-31T00:00:00Z'),
        lowerId: 100,
        upperId: 200,
      }),
    );

    expect(target.startDate).toEqual(at('2024-01-01T00:00:00Z'));
    expect(target.lowerId).toBe(100);
    expect(target.endDate).toEqual(at('2024-02-28T00:00:00Z'));
  });

  it('reaches forwards when the other manifest ends later', () => {
    const target = manifest({
      startDate: at('2024-01-01T00:00:00Z'),
      endDate: at('2024-01-31T00:00:00Z'),
      lowerId: 100,
      upperId: 200,
    });

    target.extendWith(
      manifest({
        id: 2,
        startDate: at('2024-02-01T00:00:00Z'),
        endDate: at('2024-02-28T00:00:00Z'),
        lowerId: 500,
        upperId: 600,
      }),
    );

    expect(target.endDate).toEqual(at('2024-02-28T00:00:00Z'));
    expect(target.upperId).toBe(600);
    expect(target.startDate).toEqual(at('2024-01-01T00:00:00Z'));
  });

  it('reaches the side it was told to, whatever the dates say', () => {
    const target = manifest({
      startDate: at('2024-02-01T00:00:00Z'),
      endDate: at('2024-02-28T00:00:00Z'),
      lowerId: 500,
      upperId: 600,
    });

    target.extendWith(
      manifest({
        id: 2,
        startDate: at('2024-01-01T00:00:00Z'),
        endDate: at('2024-01-31T00:00:00Z'),
        lowerId: 100,
        upperId: 200,
      }),
      'end',
    );

    expect(target.endDate).toEqual(at('2024-01-31T00:00:00Z'));
    expect(target.startDate).toEqual(at('2024-02-01T00:00:00Z'));
  });

  describe('characterised, not specified', () => {
    it('reaches forwards for a manifest wholly inside this one', () => {
      const target = manifest({
        startDate: at('2024-01-01T00:00:00Z'),
        endDate: at('2024-01-31T00:00:00Z'),
        lowerId: 100,
        upperId: 600,
      });

      target.extendWith(
        manifest({
          id: 2,
          startDate: at('2024-01-10T00:00:00Z'),
          endDate: at('2024-01-20T00:00:00Z'),
          lowerId: 200,
          upperId: 300,
        }),
      );

      expect(target.endDate).toEqual(at('2024-01-20T00:00:00Z'));
      expect(target.upperId).toBe(300);
    });
  });
});
