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
let downloadName: string;

beforeEach(() => {
  written = '';
  downloadName = '';

  vi.stubGlobal(
    'Blob',
    class {
      constructor(parts: string[]) {
        written = parts.join('');
      }
    },
  );
  vi.stubGlobal('URL', {
    createObjectURL: () => 'blob:stub',
    revokeObjectURL: () => undefined,
  });
  vi.stubGlobal('document', {
    createElement: () => ({
      set download(value: string) {
        downloadName = value;
      },
      href: '',
      click: () => undefined,
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
      [summary({ activity: { ticketHandle: 5, postDelete: 0 } } as never)],
      'janitor',
      range,
    );

    expect(headers()).not.toContain('postDelete');
  });

  it('keeps an activity somebody did, even if others did none', () => {
    exportPerformanceToCSV(
      [
        summary({ userId: 1, activity: { ticketHandle: 5 } } as never),
        summary({ userId: 2, activity: { ticketHandle: 0 } } as never),
      ],
      'janitor',
      range,
    );

    expect(rowsOf()[2]).toContain('0');
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

    expect(rowsOf()[1].filter((cell) => cell === '').length).toBeGreaterThan(2);
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

  describe('characterised, not specified', () => {
    it('does not escape a quote in a name, so the row splits early', () => {
      exportPerformanceToCSV(
        [summary({ head: { id: 500, name: 'some"one' } } as never)],
        'janitor',
        range,
      );

      expect(written).toContain('"some"one"');
    });
  });
});
