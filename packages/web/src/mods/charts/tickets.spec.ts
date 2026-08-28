import { describe, expect, it } from 'vitest';

import { TicketAgeColors, TicketAgeLabels, TicketTypeColors } from './tickets';

describe('ticket age buckets', () => {
  it('gives every bucket both a colour and a label', () => {
    expect(Object.keys(TicketAgeColors).sort()).toEqual(
      Object.keys(TicketAgeLabels).sort(),
    );
  });

  it('gives each bucket a colour of its own, so the chart reads', () => {
    const colors = Object.values(TicketAgeColors);

    expect(new Set(colors).size).toBe(colors.length);
  });

  it('names the buckets from youngest to oldest', () => {
    expect(Object.keys(TicketAgeLabels)).toEqual([
      'oneDay',
      'threeDays',
      'oneWeek',
      'twoWeeks',
      'oneMonth',
      'aboveOneMonth',
    ]);
  });

  it('marks the last bucket open ended, since it has no upper bound', () => {
    expect(TicketAgeLabels.aboveOneMonth).toContain('>');
  });
});

describe('ticket type colours', () => {
  it('gives each ticket type a colour of its own', () => {
    const colors = Object.values(TicketTypeColors);

    expect(new Set(colors).size).toBe(colors.length);
  });

  it('writes every colour as a hex value the chart can take', () => {
    for (const color of [
      ...Object.values(TicketTypeColors),
      ...Object.values(TicketAgeColors),
    ]) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
