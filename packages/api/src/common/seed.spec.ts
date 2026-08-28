import { createSeededRandom, getDailySeed } from './seed';

const at = (iso: string): Date => new Date(iso);

const take = (count: number, seed: number): number[] => {
  const random = createSeededRandom(seed);
  return Array.from({ length: count }, () => random());
};

describe('createSeededRandom', () => {
  it('gives the same run of numbers for the same seed', () => {
    expect(take(5, 42)).toEqual(take(5, 42));
  });

  it('gives a different run for a different seed', () => {
    expect(take(5, 42)).not.toEqual(take(5, 43));
  });

  it('stays between zero and one, so a caller can scale it', () => {
    for (const value of take(50, 42)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('moves on with each call rather than repeating itself', () => {
    const [first, second] = take(2, 42);

    expect(first).not.toBe(second);
  });

  it('gives two generators on one seed the same run, independently', () => {
    const one = createSeededRandom(42);
    const other = createSeededRandom(42);

    one();

    expect(other()).toBe(take(1, 42)[0]);
  });
});

describe('getDailySeed', () => {
  it('gives one seed for a whole day, whatever the hour', () => {
    expect(getDailySeed(at('2024-03-01T00:30:00Z'))).toBe(
      getDailySeed(at('2024-03-01T23:30:00Z')),
    );
  });

  it('gives a different seed the next day', () => {
    expect(getDailySeed(at('2024-03-01T12:00:00Z'))).not.toBe(
      getDailySeed(at('2024-03-02T12:00:00Z')),
    );
  });

  it('counts up as the days pass', () => {
    expect(getDailySeed(at('2024-03-02T12:00:00Z'))).toBe(
      getDailySeed(at('2024-03-01T12:00:00Z')) + 1,
    );
  });

  it('picks the same activity all day, which is the point of the seed', () => {
    const morning = createSeededRandom(
      getDailySeed(at('2024-03-01T08:00:00Z')),
    );
    const evening = createSeededRandom(
      getDailySeed(at('2024-03-01T20:00:00Z')),
    );

    expect(morning()).toBe(evening());
  });
});
