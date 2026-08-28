import { PaginationParams } from './pagination.dto';

const offsetOf = (value?: Partial<PaginationParams>): number =>
  PaginationParams.calculateOffset(
    value === undefined ? undefined : new PaginationParams(value),
  );

describe('PaginationParams.calculateOffset', () => {
  it('starts the first page at the beginning', () => {
    expect(offsetOf({ page: 1, limit: 20 })).toBe(0);
  });

  it('skips a whole page to reach the second', () => {
    expect(offsetOf({ page: 2, limit: 20 })).toBe(20);
  });

  it('skips by the page size it was given, not the default', () => {
    expect(offsetOf({ page: 3, limit: 5 })).toBe(10);
  });

  it('starts at the beginning when nobody names a page', () => {
    expect(offsetOf({ limit: 5 })).toBe(0);
  });

  it('assumes the default page size when nobody names one', () => {
    expect(offsetOf({ page: 2 })).toBe(PaginationParams.DEFAULT_PAGE_SIZE);
  });

  it('starts at the beginning when nothing is named at all', () => {
    expect(offsetOf()).toBe(0);
    expect(offsetOf({})).toBe(0);
  });

  it('counts pages from one, so no row is skipped or shown twice', () => {
    const size = 20;
    const pages = [1, 2, 3].map((page) => offsetOf({ page, limit: size }));

    expect(pages).toEqual([0, 20, 40]);
  });

  it('leaves no row between one page and the next', () => {
    const size = 7;

    expect(offsetOf({ page: 2, limit: size })).toBe(
      offsetOf({ page: 1, limit: size }) + size,
    );
  });
});

describe('PaginationParams', () => {
  it('keeps the page and size it was constructed with', () => {
    const pages = new PaginationParams({ page: 3, limit: 5 });

    expect(pages.page).toBe(3);
    expect(pages.limit).toBe(5);
  });

  it('leaves both unset when constructed with nothing', () => {
    const pages = new PaginationParams();

    expect(pages.page).toBeUndefined();
    expect(pages.limit).toBeUndefined();
  });

  it('lets a caller override a default by spreading over it', () => {
    const caller: Partial<PaginationParams> = { limit: 2 };
    const pages = new PaginationParams({ limit: 5, ...caller });

    expect(pages.limit).toBe(2);
  });
});
