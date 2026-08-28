import { DateRange, TimeScale } from './date';
import {
  TilingRange,
  chunkDateRange,
  getTilingRanges,
  groupTimesIntoRanges,
} from './tile';

const at = (iso: string): Date => new Date(iso);

const manifest = (
  startIso: string,
  endIso: string,
  type?: string,
  updatedAt?: Date,
): TilingRange => ({
  dateRange: new DateRange({
    startDate: at(startIso),
    endDate: at(endIso),
    scale: TimeScale.Hour,
  }),
  type,
  updatedAt,
});

const spans = (ranges: { dateRange: DateRange }[]): string[][] =>
  ranges.map((range) => [
    new Date(range.dateRange.startDate.getTime()).toISOString(),
    new Date(range.dateRange.endDate.getTime()).toISOString(),
  ]);

const bounds = (ranges: DateRange[]): string[][] =>
  ranges.map((range) => [
    new Date(range.startDate.getTime()).toISOString(),
    new Date(range.endDate.getTime()).toISOString(),
  ]);

describe('getTilingRanges', () => {
  it('reports the span a lone manifest covers', () => {
    const ranges = getTilingRanges(
      [manifest('2024-01-01T00:00:00Z', '2024-01-01T05:00:00Z', 'posts')],
      ['posts'],
    );

    expect(spans(ranges)).toEqual([
      ['2024-01-01T00:00:00.000Z', '2024-01-01T05:00:00.000Z'],
    ]);
  });

  it('floors a start to its hour and ceils an end past one', () => {
    const ranges = getTilingRanges(
      [manifest('2024-01-01T00:20:00Z', '2024-01-01T04:40:00Z', 'posts')],
      ['posts'],
    );

    expect(spans(ranges)).toEqual([
      ['2024-01-01T00:00:00.000Z', '2024-01-01T05:00:00.000Z'],
    ]);
  });

  it('leaves an end that already sits on the hour', () => {
    const ranges = getTilingRanges(
      [manifest('2024-01-01T00:00:00Z', '2024-01-01T04:00:00Z', 'posts')],
      ['posts'],
    );

    expect(spans(ranges)[0]![1]).toBe('2024-01-01T04:00:00.000Z');
  });

  it('reports only where every requested type is covered', () => {
    const ranges = getTilingRanges(
      [
        manifest('2024-01-01T00:00:00Z', '2024-01-01T10:00:00Z', 'posts'),
        manifest('2024-01-01T04:00:00Z', '2024-01-01T06:00:00Z', 'events'),
      ],
      ['posts', 'events'],
    );

    expect(spans(ranges)).toEqual([
      ['2024-01-01T04:00:00.000Z', '2024-01-01T06:00:00.000Z'],
    ]);
  });

  it('reports nothing when a requested type is covered nowhere', () => {
    const ranges = getTilingRanges(
      [manifest('2024-01-01T00:00:00Z', '2024-01-01T10:00:00Z', 'posts')],
      ['posts', 'events'],
    );

    expect(ranges).toEqual([]);
  });

  it('reports nothing when it is given no manifests', () => {
    expect(getTilingRanges([], ['posts'])).toEqual([]);
  });

  it('breaks a gap in coverage into two ranges', () => {
    const ranges = getTilingRanges(
      [
        manifest('2024-01-01T00:00:00Z', '2024-01-01T02:00:00Z', 'posts'),
        manifest('2024-01-01T05:00:00Z', '2024-01-01T07:00:00Z', 'posts'),
      ],
      ['posts'],
    );

    expect(spans(ranges)).toEqual([
      ['2024-01-01T00:00:00.000Z', '2024-01-01T02:00:00.000Z'],
      ['2024-01-01T05:00:00.000Z', '2024-01-01T07:00:00.000Z'],
    ]);
  });

  it('carries the latest update time of the manifests it joined', () => {
    const ranges = getTilingRanges(
      [
        manifest(
          '2024-01-01T00:00:00Z',
          '2024-01-01T10:00:00Z',
          'posts',
          at('2024-05-01T00:00:00Z'),
        ),
        manifest(
          '2024-01-01T00:00:00Z',
          '2024-01-01T10:00:00Z',
          'posts',
          at('2024-06-01T00:00:00Z'),
        ),
      ],
      ['posts'],
    );

    expect(ranges[0]!.updatedAt).toEqual(at('2024-06-01T00:00:00Z'));
  });

  it('holds one range open across a manifest that starts and ends inside another', () => {
    const ranges = getTilingRanges(
      [
        manifest('2024-01-01T00:00:00Z', '2024-01-01T06:00:00Z', 'posts'),
        manifest('2024-01-01T02:00:00Z', '2024-01-01T04:00:00Z', 'posts'),
      ],
      ['posts'],
    );

    expect(spans(ranges)).toEqual([
      ['2024-01-01T00:00:00.000Z', '2024-01-01T06:00:00.000Z'],
    ]);
  });

  describe('characterised, not specified', () => {
    it('splits where two manifests meet exactly, whichever order they arrive in', () => {
      const later = manifest(
        '2024-01-01T02:00:00Z',
        '2024-01-01T04:00:00Z',
        'posts',
      );
      const earlier = manifest(
        '2024-01-01T00:00:00Z',
        '2024-01-01T02:00:00Z',
        'posts',
      );

      expect(spans(getTilingRanges([later, earlier], ['posts']))).toEqual([
        ['2024-01-01T00:00:00.000Z', '2024-01-01T02:00:00.000Z'],
        ['2024-01-01T02:00:00.000Z', '2024-01-01T04:00:00.000Z'],
      ]);
    });

    it('splits rather than joins where two manifests of a type meet exactly', () => {
      const ranges = getTilingRanges(
        [
          manifest('2024-01-01T00:00:00Z', '2024-01-01T02:00:00Z', 'posts'),
          manifest('2024-01-01T02:00:00Z', '2024-01-01T04:00:00Z', 'posts'),
        ],
        ['posts'],
      );

      expect(spans(ranges)).toEqual([
        ['2024-01-01T00:00:00.000Z', '2024-01-01T02:00:00.000Z'],
        ['2024-01-01T02:00:00.000Z', '2024-01-01T04:00:00.000Z'],
      ]);
    });
  });
});

describe('groupTimesIntoRanges', () => {
  it('gives back nothing for no times', () => {
    expect(groupTimesIntoRanges([])).toEqual([]);
  });

  it('turns one time into the hour that follows it', () => {
    expect(bounds(groupTimesIntoRanges([at('2024-01-01T03:00:00Z')]))).toEqual([
      ['2024-01-01T03:00:00.000Z', '2024-01-01T04:00:00.000Z'],
    ]);
  });

  it('joins hours that touch into one range', () => {
    expect(
      bounds(
        groupTimesIntoRanges([
          at('2024-01-01T03:00:00Z'),
          at('2024-01-01T04:00:00Z'),
          at('2024-01-01T05:00:00Z'),
        ]),
      ),
    ).toEqual([['2024-01-01T03:00:00.000Z', '2024-01-01T06:00:00.000Z']]);
  });

  it('breaks where an hour is missing', () => {
    expect(
      bounds(
        groupTimesIntoRanges([
          at('2024-01-01T03:00:00Z'),
          at('2024-01-01T05:00:00Z'),
        ]),
      ),
    ).toEqual([
      ['2024-01-01T03:00:00.000Z', '2024-01-01T04:00:00.000Z'],
      ['2024-01-01T05:00:00.000Z', '2024-01-01T06:00:00.000Z'],
    ]);
  });

  it('sorts times it was given out of order', () => {
    expect(
      bounds(
        groupTimesIntoRanges([
          at('2024-01-01T05:00:00Z'),
          at('2024-01-01T03:00:00Z'),
          at('2024-01-01T04:00:00Z'),
        ]),
      ),
    ).toEqual([['2024-01-01T03:00:00.000Z', '2024-01-01T06:00:00.000Z']]);
  });
});

describe('chunkDateRange', () => {
  it('leaves a range shorter than the chunk whole', () => {
    const chunks = chunkDateRange(
      new DateRange({
        startDate: at('2024-01-01T00:00:00Z'),
        endDate: at('2024-01-01T10:00:00Z'),
      }),
      30,
    );

    expect(bounds(chunks)).toEqual([
      ['2024-01-01T00:00:00.000Z', '2024-01-01T10:00:00.000Z'],
    ]);
  });

  it('cuts a longer range into chunks, the last one short', () => {
    const chunks = chunkDateRange(
      new DateRange({
        startDate: at('2024-01-01T00:00:00Z'),
        endDate: at('2024-01-04T00:00:00Z'),
      }),
      30,
    );

    expect(bounds(chunks)).toEqual([
      ['2024-01-01T00:00:00.000Z', '2024-01-02T06:00:00.000Z'],
      ['2024-01-02T06:00:00.000Z', '2024-01-03T12:00:00.000Z'],
      ['2024-01-03T12:00:00.000Z', '2024-01-04T00:00:00.000Z'],
    ]);
  });

  it('leaves no gap and no overlap between chunks', () => {
    const chunks = chunkDateRange(
      new DateRange({
        startDate: at('2024-01-01T00:00:00Z'),
        endDate: at('2024-01-07T13:00:00Z'),
      }),
      30,
    );

    chunks.slice(1).forEach((chunk, index) => {
      expect(chunk.startDate.getTime()).toBe(chunks[index]!.endDate.getTime());
    });
    expect(chunks[chunks.length - 1]!.endDate.getTime()).toBe(
      at('2024-01-07T13:00:00Z').getTime(),
    );
  });

  it('gives back nothing for a range that ends before it starts', () => {
    const chunks = chunkDateRange(
      new DateRange({
        startDate: at('2024-01-04T00:00:00Z'),
        endDate: at('2024-01-01T00:00:00Z'),
      }),
      30,
    );

    expect(chunks).toEqual([]);
  });
});
