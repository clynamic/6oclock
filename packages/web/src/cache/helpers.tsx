import _ from "lodash";

export interface WithId {
  id: number;
}

export const findLowestId = (items: WithId[] | undefined) => {
  if (items == null || items.length === 0) return undefined;
  return items.reduce((prev, current) =>
    prev.id < current.id ? prev : current
  );
};

export const mergeWithCache = <T extends WithId>(
  cachedItems: T[] | undefined,
  freshItems: T[] | undefined
) => {
  if (cachedItems == null && freshItems == null) return undefined;
  return _.unionBy(cachedItems, freshItems, "id");
};

export const findUncachedItems = <T extends WithId>(
  cachedItems: T[] | undefined,
  freshItems: T[]
) => {
  const existing = cachedItems?.map((item) => item.id) ?? [];
  return _.filter(freshItems, (item) => !_.includes(existing, item.id));
};
