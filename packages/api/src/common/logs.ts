import { Logger } from '@nestjs/common';
import { ItemType } from 'src/label/label.entity';
import { Order } from 'src/manifest/manifest.entity';

import { WithDate, findDateBounds } from './date';
import { WithId, findContiguityGaps, findIdBounds } from './id-range.dto';

/**
 * Log the order fetch for a given item type and order.
 */
export const logOrderFetch = (logger: Logger, type: ItemType, order: Order) => {
  const { dateRange, idRange } = order;

  logger.log({
    msg: 'Fetching {type} for {range} with ids {ids}',
    type,
    range: { start: dateRange.startDate, end: dateRange.endDate },
    ids: { start: idRange.startId, end: idRange.endId },
  });
};

/**
 * Log the order result for a given item type.
 */
export const logOrderResult = (
  logger: Logger,
  type: ItemType,
  items: (WithId & WithDate)[],
) => {
  const idRange = findIdBounds(items);
  const dateRange = findDateBounds(items);
  logger.log({
    msg: 'Found {count} {type} with ids {ids} and dates {range}',
    type,
    count: items.length,
    ids: { start: idRange.startId, end: idRange.endId },
    range: { start: dateRange.startDate, end: dateRange.endDate },
  });
};

/**
 * Log the contiguity gaps in a given list of items.
 */
export const logContiguityGaps = (
  logger: Logger,
  type: ItemType,
  items: WithId[],
) => {
  const gaps = findContiguityGaps(items);
  if (gaps.length > 0) {
    logger.warn({
      msg: 'Found {count} gaps in {type} id contiguity',
      type,
      count: gaps.length,
      gaps,
    });
  }
};
