import { useEffect, useState } from 'react';

import { TZDate, tz } from '@date-fns/tz';
import { CronExpressionParser } from 'cron-parser';
import { isSameDay, parseISO } from 'date-fns';

import { createSeededRandom, getDailySeed } from '../utils/seed';
import { SHIP_TIMEZONE } from '../utils/timezone';

/**
 * The exclusivity level of a message.
 * - "absolute": Always selected, if present.
 * - "featured": Selected if no absolute messages are present.
 * - "default": Selected if no absolute or featured messages are present.
 */
type MotdTier = 'absolute' | 'featured' | 'default';

interface MotdItem {
  /**
   * The message to display.
   */
  message: string;
  /**
   * The relative weight of this message when selected within its tier.
   * If not specified, it defaults to 1.0.
   */
  weight?: number;
  /**
   * An ISO 8601 date string (e.g., "2023-12-25") for which this message should be displayed.
   * If the current date matches this date, this message will be selected.
   * Not compatible with the `schedule` field.
   */
  date?: string;
  /**
   * A cron expression (e.g., "0 9 * * 1") defining a schedule for this message.
   * If the current date matches the schedule, this message will be selected.
   * Not compatible with the `date` field.
   */
  schedule?: string;
  /**
   * The exclusivity level of this message. If omitted, it is treated as "default".
   */
  tier?: MotdTier;
}

const getMotdDate = () => TZDate.tz(SHIP_TIMEZONE);

const isDateMatch = (dateStr: string): boolean => {
  try {
    const now = getMotdDate();
    const targetDate = parseISO(dateStr, { in: tz(SHIP_TIMEZONE) });
    return isSameDay(now, targetDate);
  } catch {
    return false;
  }
};

const isScheduleMatch = (schedule: string): boolean => {
  try {
    const now = getMotdDate();

    const interval = CronExpressionParser.parse(schedule, {
      currentDate: now,
      tz: SHIP_TIMEZONE,
    });

    const next = interval.next().toDate();
    const prev = interval.prev().toDate();

    return isSameDay(now, next) || isSameDay(now, prev);
  } catch {
    return false;
  }
};

const getMotdData = async (): Promise<MotdItem[]> => {
  const response = await fetch('/assets/motd.json');
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const isEligibleToday = (item: MotdItem): boolean => {
  if (item.date) return isDateMatch(item.date);
  if (item.schedule) return isScheduleMatch(item.schedule);
  return !item.date && !item.schedule;
};

const normalizeTier = (tier?: MotdTier): MotdTier => tier ?? 'default';

const pickWeighted = (
  random: () => number,
  items: Array<{ message: string; weight: number }>,
): string | undefined => {
  if (items.length === 0) return;
  const total = items.reduce((s, it) => s + it.weight, 0);
  if (total <= 0) return;
  const r = random() * total;
  let acc = 0;
  for (const it of items) {
    acc += it.weight;
    if (r <= acc) return it.message;
  }
};

const selectMotd = (items: MotdItem[]): string | undefined => {
  if (items.length === 0) return;

  const seed = getDailySeed(getMotdDate());
  const random = createSeededRandom(seed);

  const eligible = items.filter(isEligibleToday);
  if (eligible.length === 0) return;

  const byTier = new Map<MotdTier, MotdItem[]>();
  for (const it of eligible) {
    const t = normalizeTier(it.tier);
    const arr = byTier.get(t) ?? [];
    arr.push(it);
    byTier.set(t, arr);
  }

  const tierOrder: MotdTier[] = ['absolute', 'featured', 'default'];
  let arena: MotdItem[] | undefined;
  for (const t of tierOrder) {
    const arr = byTier.get(t);
    if (arr && arr.length > 0) {
      arena = arr;
      break;
    }
  }
  if (!arena || arena.length === 0) return;

  const weighted = arena.map((it) => ({
    message: it.message,
    weight: it.weight ?? 1.0,
  }));

  return pickWeighted(random, weighted);
};

const defaultMotd = 'Your valiant efforts are appreciated.';

export const HomeMotd: React.FC = () => {
  const [motdMessage, setMotdMessage] = useState(defaultMotd);

  useEffect(() => {
    const loadMotd = async () => {
      try {
        const items = await getMotdData();
        const message = selectMotd(items);
        if (message) {
          setMotdMessage(message);
        }
      } catch {
        // no-op
      }
    };

    loadMotd();
  }, []);

  return <span dangerouslySetInnerHTML={{ __html: motdMessage }} />;
};
