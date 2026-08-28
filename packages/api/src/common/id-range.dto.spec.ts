import {
  findContiguityGaps,
  findHighestId,
  findIdBounds,
  findLowestId,
} from './id-range.dto';

const ids = (...values: number[]): { id: number }[] =>
  values.map((id) => ({ id }));

describe('findLowestId', () => {
  it('picks the item with the lowest id, not the id', () => {
    const lowest = { id: 2 };

    expect(findLowestId([{ id: 9 }, lowest, { id: 5 }])).toBe(lowest);
  });

  it('gives back nothing for an empty list', () => {
    expect(findLowestId([])).toBeUndefined();
  });

  it('gives back nothing when there is no list at all', () => {
    expect(findLowestId(undefined)).toBeUndefined();
  });
});

describe('findHighestId', () => {
  it('picks the item with the highest id, not the id', () => {
    const highest = { id: 9 };

    expect(findHighestId([{ id: 2 }, highest, { id: 5 }])).toBe(highest);
  });

  it('gives back nothing for an empty list', () => {
    expect(findHighestId([])).toBeUndefined();
  });

  it('gives back nothing when there is no list at all', () => {
    expect(findHighestId(undefined)).toBeUndefined();
  });
});

describe('findIdBounds', () => {
  it('spans from the lowest id to the highest', () => {
    expect(findIdBounds(ids(5, 2, 9))).toEqual(
      expect.objectContaining({ startId: 2, endId: 9 }),
    );
  });

  it('collapses a single item onto itself', () => {
    expect(findIdBounds(ids(7))).toEqual(
      expect.objectContaining({ startId: 7, endId: 7 }),
    );
  });

  it('leaves both bounds open when there is nothing to span', () => {
    const bounds = findIdBounds([]);

    expect(bounds.startId).toBeUndefined();
    expect(bounds.endId).toBeUndefined();
  });
});

describe('findContiguityGaps', () => {
  it('finds nothing missing in a run with no holes', () => {
    expect(findContiguityGaps(ids(1, 2, 3, 4))).toEqual([]);
  });

  it('reports a hole by the id it opens after, and how wide it is', () => {
    expect(findContiguityGaps(ids(1, 2, 5))).toEqual([{ 2: 2 }]);
  });

  it('reports each hole separately', () => {
    expect(findContiguityGaps(ids(1, 3, 5))).toEqual([{ 1: 1 }, { 3: 1 }]);
  });

  it('sorts before it looks, so an unordered list reads the same', () => {
    expect(findContiguityGaps(ids(5, 1, 2))).toEqual(
      findContiguityGaps(ids(1, 2, 5)),
    );
  });

  it('leaves the list it was handed in the order it came', () => {
    const items = ids(5, 1, 2);

    findContiguityGaps(items);

    expect(items.map((item) => item.id)).toEqual([5, 1, 2]);
  });

  it('finds nothing in a single item, since a gap needs two sides', () => {
    expect(findContiguityGaps(ids(7))).toEqual([]);
  });

  it('finds nothing in an empty list', () => {
    expect(findContiguityGaps([])).toEqual([]);
  });

  it('finds nothing when there is no list at all', () => {
    expect(findContiguityGaps(undefined)).toEqual([]);
  });

  it('measures a wide hole by how many ids it swallowed', () => {
    expect(findContiguityGaps(ids(1, 100))).toEqual([{ 1: 98 }]);
  });

  describe('characterised, not specified', () => {
    it('reads a repeated id as no gap rather than as an overlap', () => {
      expect(findContiguityGaps(ids(1, 1, 2))).toEqual([]);
    });
  });
});
