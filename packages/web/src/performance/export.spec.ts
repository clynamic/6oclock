import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PerformanceSummary } from '../api';
import { exportPerformanceToCSV } from './export';

const at = (iso: string): Date => new Date(iso);

const range = {
  startDate: at('2024-04-01T00:00:00Z'),
  endDate: at('2024-05-01T00:00:00Z'),
};

const summary = (partial?: Partial<PerformanceSummary>): PerformanceSummary =>
  ({
    scoreGrade: 'good',
    trendGrade: 'neutral',
    userId: 500,
    head: { id: 500, name: 'someone' },
    position: 1,
    score: 10,
    trend: 0,
    history: [],
    activity: {},
    days: 30,
    ...partial,
  }) as PerformanceSummary;

let written: string;
let blobType: string;
let downloadName: string;
let link: { href: string; download: string; clicked: number };
let createdUrls: string[];
let revokedUrls: string[];

beforeEach(() => {
  written = '';
  blobType = '';
  downloadName = '';
  createdUrls = [];
  revokedUrls = [];
  link = { href: '', download: '', clicked: 0 };

  vi.stubGlobal(
    'Blob',
    class {
      constructor(parts: string[], options?: { type?: string }) {
        written = parts.join('');
        blobType = options?.type ?? '';
      }
    },
  );
  vi.stubGlobal('URL', {
    createObjectURL: () => {
      const url = `blob:stub-${createdUrls.length}`;
      createdUrls.push(url);
      return url;
    },
    revokeObjectURL: (url: string) => {
      revokedUrls.push(url);
    },
  });
  vi.stubGlobal('document', {
    createElement: () => ({
      get href() {
        return link.href;
      },
      set href(value: string) {
        link.href = value;
      },
      get download() {
        return link.download;
      },
      set download(value: string) {
        link.download = value;
        downloadName = value;
      },
      click: () => {
        link.clicked++;
      },
    }),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const rowsOf = (): string[][] =>
  written
    .split('\n')
    .map((line) => line.split(',').map((cell) => cell.replace(/^"|"$/g, '')));

const headers = (): string[] => rowsOf()[0];

describe('exportPerformanceToCSV', () => {
  it('names the first column for the person the row is about', () => {
    exportPerformanceToCSV([summary()], 'janitor', range);

    expect(headers()[0]).toBe('Username');
  });

  it('writes the account name when there is one', () => {
    exportPerformanceToCSV([summary()], 'janitor', range);

    expect(rowsOf()[1][0]).toBe('someone');
  });

  it('falls back to the account id when there is no name', () => {
    exportPerformanceToCSV([summary({ head: undefined })], 'janitor', range);

    expect(rowsOf()[1][0]).toBe('User 500');
  });

  it('leaves out an activity nobody did any of', () => {
    exportPerformanceToCSV(
      [
        summary({
          activity: { ticket_update_approved: 5, deleted: 0 },
        } as never),
      ],
      'janitor',
      range,
    );

    expect(headers()).toContain('Tickets');
    expect(headers()).not.toContain('Deletions');
  });

  it('keeps an activity somebody did, even if others did none', () => {
    exportPerformanceToCSV(
      [
        summary({
          userId: 1,
          activity: { ticket_update_approved: 5 },
        } as never),
        summary({
          userId: 2,
          activity: { ticket_update_approved: 0 },
        } as never),
      ],
      'janitor',
      range,
    );

    const column = headers().indexOf('Tickets');

    expect(rowsOf()[1][column]).toBe('5');
    expect(rowsOf()[2][column]).toBe('0');
  });

  it('sorts the activity columns, so two exports line up', () => {
    exportPerformanceToCSV(
      [
        summary({
          activity: { ticket_update_approved: 5, approved: 3, deleted: 1 },
        } as never),
      ],
      'janitor',
      range,
    );

    const columns = headers().slice(1, 4);

    expect(columns).toEqual(['Approvals', 'Deletions', 'Tickets']);
  });

  it('names the three months before the range, in order', () => {
    exportPerformanceToCSV([summary()], 'janitor', range);

    const row = headers();

    expect(row).toContain('January');
    expect(row).toContain('February');
    expect(row).toContain('March');
    expect(row.indexOf('January')).toBeLessThan(row.indexOf('February'));
    expect(row.indexOf('February')).toBeLessThan(row.indexOf('March'));
  });

  it('names the month the range starts in', () => {
    exportPerformanceToCSV([summary()], 'janitor', range);

    expect(headers()).toContain('April');
  });

  it('reads history oldest first, skipping the current record', () => {
    exportPerformanceToCSV(
      [
        summary({
          history: [
            { grade: 'good', score: 40 },
            { grade: 'good', score: 30 },
            { grade: 'good', score: 20 },
            { grade: 'good', score: 10 },
          ],
        } as never),
      ],
      'janitor',
      range,
    );

    const row = rowsOf()[1];

    expect(row).toContain('10');
    expect(row.indexOf('10')).toBeLessThan(row.indexOf('20'));
    expect(row.indexOf('20')).toBeLessThan(row.indexOf('30'));
    expect(row).not.toContain('40');
  });

  it('leaves the oldest months blank when the history is short', () => {
    exportPerformanceToCSV(
      [
        summary({
          history: [
            { grade: 'good', score: 40 },
            { grade: 'good', score: 30 },
          ],
        } as never),
      ],
      'janitor',
      range,
    );

    const january = headers().indexOf('January');
    const row = rowsOf()[1];

    expect(row.slice(january, january + 3)).toEqual(['', '', '30']);
  });

  it('closes the row with the score, grade, symbol and number', () => {
    exportPerformanceToCSV(
      [summary({ score: 42, scoreGrade: 'good', trend: 7 } as never)],
      'janitor',
      range,
    );

    const row = rowsOf()[1];

    expect(row.slice(-4)).toEqual(['42', 'good', '→', '7']);
  });

  it('names the file for the area and the range it covers', () => {
    exportPerformanceToCSV([summary()], 'janitor', range);

    expect(downloadName).toBe('Performance Janitor April 2024.csv');
  });

  it('names an export with no area a sheet', () => {
    exportPerformanceToCSV([summary()], undefined, range);

    expect(downloadName).toContain('Performance Sheet');
  });

  it('writes a header row and one row per person', () => {
    exportPerformanceToCSV(
      [summary({ userId: 1 }), summary({ userId: 2 })],
      'janitor',
      range,
    );

    expect(written.split('\n')).toHaveLength(3);
  });

  describe('handing the file to the browser', () => {
    it('actually clicks the link, since nothing downloads otherwise', () => {
      exportPerformanceToCSV([summary()], 'janitor', range);

      expect(link.clicked).toBe(1);
    });

    it('points the link at the file it just built', () => {
      exportPerformanceToCSV([summary()], 'janitor', range);

      expect(link.href).toBe(createdUrls[0]);
      expect(createdUrls).toHaveLength(1);
    });

    it('offers it as a csv, so a spreadsheet opens it', () => {
      exportPerformanceToCSV([summary()], 'janitor', range);

      expect(blobType).toContain('text/csv');
    });

    it('releases the url afterwards rather than leaking it', () => {
      exportPerformanceToCSV([summary()], 'janitor', range);

      expect(revokedUrls).toEqual(createdUrls);
    });
  });

  it('doubles a quote inside a cell, so the row stays whole', () => {
    exportPerformanceToCSV(
      [summary({ head: { id: 500, name: 'some"one' } } as never)],
      'janitor',
      range,
    );

    expect(written).toContain('"some""one"');
    expect(written).not.toContain('"some"one"');
  });
});
