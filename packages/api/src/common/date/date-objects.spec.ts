import {
  findDateBounds,
  findHighestDate,
  findLowestDate,
  resolveWithDate,
} from './date-objects';

const at = (iso: string): Date => new Date(iso);

describe('resolveWithDate', () => {
  it('reads the creation date when there is one', () => {
    expect(resolveWithDate({ createdAt: at('2024-01-01T00:00:00Z') })).toEqual(
      at('2024-01-01T00:00:00Z'),
    );
  });

  it('treats an update date as the creation date when that is all there is', () => {
    expect(resolveWithDate({ updatedAt: at('2024-01-01T00:00:00Z') })).toEqual(
      at('2024-01-01T00:00:00Z'),
    );
  });

  it('prefers creation over update, so an edit never moves the date', () => {
    expect(
      resolveWithDate({
        createdAt: at('2024-01-01T00:00:00Z'),
        updatedAt: at('2024-06-01T00:00:00Z'),
      }),
    ).toEqual(at('2024-01-01T00:00:00Z'));
  });

  it('gives back nothing for nothing', () => {
    expect(resolveWithDate(undefined)).toBeUndefined();
  });
});

describe('findLowestDate', () => {
  it('picks the earliest item, not its date', () => {
    const earliest = { id: 2, createdAt: at('2024-01-01T00:00:00Z') };

    expect(
      findLowestDate([
        { id: 1, createdAt: at('2024-06-01T00:00:00Z') },
        earliest,
        { id: 3, createdAt: at('2024-03-01T00:00:00Z') },
      ]),
    ).toBe(earliest);
  });

  it('gives back nothing for an empty list', () => {
    expect(findLowestDate([])).toBeUndefined();
  });

  it('gives back nothing when there is no list at all', () => {
    expect(findLowestDate(undefined)).toBeUndefined();
  });
});

describe('findHighestDate', () => {
  it('picks the latest item, not its date', () => {
    const latest = { id: 2, createdAt: at('2024-09-01T00:00:00Z') };

    expect(
      findHighestDate([
        { id: 1, createdAt: at('2024-06-01T00:00:00Z') },
        latest,
        { id: 3, createdAt: at('2024-03-01T00:00:00Z') },
      ]),
    ).toBe(latest);
  });

  it('gives back nothing for an empty list', () => {
    expect(findHighestDate([])).toBeUndefined();
  });
});

describe('characterised, not specified', () => {
  it('keeps the last of two items sharing the earliest date', () => {
    const last = { id: 2, createdAt: at('2024-01-01T00:00:00Z') };

    expect(
      findLowestDate([{ id: 1, createdAt: at('2024-01-01T00:00:00Z') }, last]),
    ).toBe(last);
  });

  it('keeps the last of two items sharing the latest date', () => {
    const last = { id: 2, createdAt: at('2024-09-01T00:00:00Z') };

    expect(
      findHighestDate([{ id: 1, createdAt: at('2024-09-01T00:00:00Z') }, last]),
    ).toBe(last);
  });
});

describe('findDateBounds', () => {
  it('spans from the earliest date to the latest', () => {
    expect(
      findDateBounds([
        { createdAt: at('2024-06-01T00:00:00Z') },
        { createdAt: at('2024-01-01T00:00:00Z') },
        { createdAt: at('2024-09-01T00:00:00Z') },
      ]),
    ).toEqual(
      expect.objectContaining({
        startDate: at('2024-01-01T00:00:00Z'),
        endDate: at('2024-09-01T00:00:00Z'),
      }),
    );
  });

  it('collapses a single item to a range starting and ending on it', () => {
    const bounds = findDateBounds([{ createdAt: at('2024-06-01T00:00:00Z') }]);

    expect(bounds.startDate).toEqual(at('2024-06-01T00:00:00Z'));
    expect(bounds.endDate).toEqual(at('2024-06-01T00:00:00Z'));
  });

  it('leaves both bounds open when there is nothing to span', () => {
    const bounds = findDateBounds([]);

    expect(bounds.startDate).toBeUndefined();
    expect(bounds.endDate).toBeUndefined();
  });

  it('spans by creation date even where an update date is later', () => {
    const bounds = findDateBounds([
      {
        createdAt: at('2024-01-01T00:00:00Z'),
        updatedAt: at('2024-12-01T00:00:00Z'),
      },
      {
        createdAt: at('2024-02-01T00:00:00Z'),
        updatedAt: at('2024-12-01T00:00:00Z'),
      },
    ]);

    expect(bounds.endDate).toEqual(at('2024-02-01T00:00:00Z'));
  });
});
