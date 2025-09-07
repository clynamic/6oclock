import { useEffect, useState } from 'react';

import { TZDate, tz } from '@date-fns/tz';
import { CronExpressionParser } from 'cron-parser';
import { isSameDay, parseISO } from 'date-fns';

import { createSeededRandom, getTodaySeed } from '../utils/seed';
import { SHIP_TIMEZONE } from '../utils/timezone';

interface MotdItem {
  /**
   * The message to display.
   */
  message: string;
  /**
   * The likelihood (0.0 to 1.0) of this message being selected.
   * If not specified, it defaults to 1.0.
   */
  chance?: number;
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
}

const isDateMatch = (dateStr: string): boolean => {
  try {
    const now = TZDate.tz(SHIP_TIMEZONE);
    const targetDate = parseISO(dateStr, { in: tz(SHIP_TIMEZONE) });
    return isSameDay(now, targetDate);
  } catch {
    return false;
  }
};

const isScheduleMatch = (schedule: string): boolean => {
  try {
    const now = TZDate.tz(SHIP_TIMEZONE);

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

const selectMotd = (items: MotdItem[]): string | undefined => {
  if (items.length === 0) return;

  const seed = getTodaySeed();
  const random = createSeededRandom(seed);

  const arena: MotdItem[] = [];

  if (arena.length === 0) {
    const dateMatches = items.filter(
      (item) => item.date && isDateMatch(item.date),
    );
    arena.push(...dateMatches);
  }
  if (arena.length === 0) {
    const scheduleMatches = items.filter(
      (item) => item.schedule && isScheduleMatch(item.schedule),
    );
    arena.push(...scheduleMatches);
  }
  if (arena.length === 0) {
    arena.push(...items.filter((item) => !item.date && !item.schedule));
  }

  if (arena.length === 0) return;

  const weightedItems: Array<{ message: string; weight: number }> = arena.map(
    (item) => ({
      message: item.message,
      weight: item.chance ?? 1.0,
    }),
  );

  const totalWeight = weightedItems.reduce((sum, item) => sum + item.weight, 0);
  const randomValue = random() * totalWeight;

  let currentWeight = 0;
  for (const item of weightedItems) {
    currentWeight += item.weight;
    if (randomValue <= currentWeight) {
      return item.message;
    }
  }

  return weightedItems[0].message;
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

  return motdMessage;
};
