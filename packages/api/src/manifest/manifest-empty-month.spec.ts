import { ItemType } from 'src/label/label.entity';

import { ManifestEntity, Order, OrderResults } from './manifest.entity';
import { ManifestUtils } from './manifest.utils';

const at = (iso: string): Date => new Date(iso);

const item = (id: number, iso: string) => ({ id, createdAt: at(iso) });

const results = (items: { id: number; createdAt: Date }[]): OrderResults => ({
  type: ItemType.appeals,
  order: new Order({
    lower: at('2024-01-01T00:00:00Z'),
    upper: at('2024-04-01T00:00:00Z'),
  }),
  items,
  bottom: false,
  top: false,
});

describe('a month nothing landed in', () => {
  it('still gets a manifest, since the range was covered either way', () => {
    const rewrite = ManifestUtils.computeSaveResults(
      results([
        item(1, '2024-01-15T00:00:00Z'),
        item(2, '2024-03-15T00:00:00Z'),
      ]),
      at('2024-04-01T00:00:00Z'),
    );

    const months = [...rewrite.save, rewrite.order.upper as ManifestEntity]
      .filter((manifest) => manifest instanceof ManifestEntity)
      .map((manifest) => manifest.startDate.toISOString());

    expect(months).toContain('2024-02-01T00:00:00.000Z');
  });

  describe('characterised, not specified', () => {
    it('claims no ids at all, which the not-null column rejects', () => {
      const rewrite = ManifestUtils.computeSaveResults(
        results([
          item(1, '2024-01-15T00:00:00Z'),
          item(2, '2024-03-15T00:00:00Z'),
        ]),
        at('2024-04-01T00:00:00Z'),
      );

      const february = [...rewrite.save, rewrite.order.upper]
        .filter(
          (manifest): manifest is ManifestEntity =>
            manifest instanceof ManifestEntity,
        )
        .find(
          (manifest) =>
            manifest.startDate.toISOString() === '2024-02-01T00:00:00.000Z',
        );

      expect(february).toBeDefined();
      expect(february!.lowerId).toBeUndefined();
      expect(february!.upperId).toBeUndefined();
    });

    it('keeps real ids on the months that did have items', () => {
      const rewrite = ManifestUtils.computeSaveResults(
        results([
          item(1, '2024-01-15T00:00:00Z'),
          item(2, '2024-03-15T00:00:00Z'),
        ]),
        at('2024-04-01T00:00:00Z'),
      );

      const produced = [...rewrite.save, rewrite.order.upper].filter(
        (manifest): manifest is ManifestEntity =>
          manifest instanceof ManifestEntity,
      );

      const withIds = produced.filter(
        (manifest) => manifest.lowerId !== undefined,
      );
      const without = produced.filter(
        (manifest) => manifest.lowerId === undefined,
      );

      expect(withIds.map((manifest) => manifest.lowerId).sort()).toEqual([
        1, 2,
      ]);
      expect(without).toHaveLength(1);
    });
  });
});
