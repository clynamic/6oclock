/* eslint-disable react-refresh/only-export-components */
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  useState,
} from "react";
import { DateRange } from "../utils";

export type CacheItemKey = number;

interface CacheData {
  id: CacheItemKey;
  created_at?: Date;
  updated_at?: Date;
}

interface CacheItemId {
  type: string;
  id: CacheItemKey;
}

interface CacheItem<T extends CacheData> {
  type: string;
  updated: Date;
  value: T;
}

interface LocalCacheContextType {
  query: <T extends CacheData>(
    params: LocalCacheQueryParams
  ) => Promise<CacheItem<T>[]>;
  store: <T extends CacheData>(items: CacheItem<T>[]) => Promise<boolean>;
  remove: (items: CacheItemId[]) => Promise<boolean>;
  clearStale: (type: string, staleDuration: number) => Promise<void>;
}

interface LocalCacheProviderProps {
  children: ReactNode;
}

type DBType = IDBDatabase | null;

const LocalCacheContext = createContext<LocalCacheContextType | null>(null);

const openDatabase = (): Promise<DBType> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("LocalCacheDB", 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("cache")) {
        const store = db.createObjectStore("cache", { keyPath: "key" });
        store.createIndex("type_created_at", ["type", "value.created_at"], {
          unique: false,
        });
        store.createIndex("type_updated_at", ["type", "value.updated_at"], {
          unique: false,
        });
        store.createIndex("id_index", "value.id");
      }
    };

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event: Event) => {
      console.error(
        "Failed to open database",
        (event.target as IDBOpenDBRequest).error
      );
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export interface LocalCacheQueryParams {
  type?: string;
  created?: Partial<DateRange>;
  updated?: Partial<DateRange>;
  staleDuration?: number;
  id?: CacheItemKey;
}

const getItemKey = (type: string, id: CacheItemKey): string => {
  return `/${type}/${id}`;
};

const query = <T extends CacheData>(
  db: DBType,
  params: LocalCacheQueryParams
): Promise<CacheItem<T>[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database is not initialized"));
      return;
    }

    const { type, created, updated, staleDuration, id } = params;
    const transaction = db.transaction(["cache"], "readonly");
    const store = transaction.objectStore("cache");

    const results: CacheItem<T>[] = [];
    let cursorRequest: IDBRequest<IDBCursorWithValue | null> | undefined;

    try {
      if (id) {
        const idIndex = store.index("id_index");
        cursorRequest = idIndex.openCursor(IDBKeyRange.only(id));
      } else if (type && created) {
        const typeCreatedAtIndex = store.index("type_created_at");
        const startDateStr = created.start?.toISOString();
        const endDateStr = created.end?.toISOString();

        cursorRequest = typeCreatedAtIndex.openCursor(
          IDBKeyRange.bound(
            [type, startDateStr],
            [type, endDateStr],
            !!startDateStr,
            !!endDateStr
          )
        );
      } else if (type && updated) {
        const typeUpdatedAtIndex = store.index("type_updated_at");
        const startDateStr = updated.start?.toISOString();
        const endDateStr = updated.end?.toISOString();

        cursorRequest = typeUpdatedAtIndex.openCursor(
          IDBKeyRange.bound(
            [type, startDateStr],
            [type, endDateStr],
            !!startDateStr,
            !!endDateStr
          )
        );
      } else if (type) {
        const typeIndex = store.index("type_created_at");
        cursorRequest = typeIndex.openCursor(
          IDBKeyRange.bound([type, ""], [type, "\uffff"])
        );
      } else {
        cursorRequest = store.openCursor();
      }
    } catch (error) {
      console.error("Failed to open cursor", error);
      reject(new Error("Failed to open cursor"));
      return;
    }

    cursorRequest.onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

      if (cursor) {
        const item = cursor.value as CacheItem<T>;

        const isStale = staleDuration
          ? new Date(item.updated).getTime() < Date.now() - staleDuration
          : false;

        if (!isStale) {
          results.push(item);
        }

        cursor.continue();
      } else {
        resolve(results);
      }
    };

    cursorRequest.onerror = (event: Event) => {
      console.error(
        "Cursor request failed",
        (event.target as IDBRequest).error
      );
      reject((event.target as IDBRequest).error);
    };
  });
};

const store = <T extends CacheData>(
  db: DBType,
  items: CacheItem<T>[]
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database is not initialized"));
      return;
    }

    const transaction = db.transaction(["cache"], "readwrite");
    const store = transaction.objectStore("cache");

    transaction.oncomplete = () => {
      resolve(true);
    };

    transaction.onerror = (event: Event) => {
      console.error(
        "Failed to store items",
        (event.target as IDBTransaction).error
      );
      reject((event.target as IDBTransaction).error);
    };

    try {
      for (const item of items) {
        const { type, updated, value } = item;
        const key = getItemKey(type, value.id);
        store.put({ key, type, updated, value });
      }
    } catch (error) {
      console.error("Error during batch insert", error);
      reject(error);
    }
  });
};

const remove = (db: DBType, items: CacheItemId[]): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database is not initialized"));
      return;
    }

    const transaction = db.transaction(["cache"], "readwrite");
    const store = transaction.objectStore("cache");
    const requests: IDBRequest<undefined>[] = [];

    for (const item of items) {
      const key = getItemKey(item.type, item.id);
      const request = store.delete(key);
      requests.push(request);
    }

    let success = true;

    transaction.oncomplete = () => {
      resolve(success);
    };

    transaction.onerror = (event: Event) => {
      console.error(
        "Failed to remove item",
        (event.target as IDBTransaction).error
      );
      success = false;
      resolve(success);
    };

    for (let i = 0; i < requests.length; i++) {
      requests[i].onerror = () => {
        success = false;
      };
    }
  });
};

export const LocalCacheProvider: React.FC<LocalCacheProviderProps> = ({
  children,
}) => {
  const dbRef = useRef<DBType>(null);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    openDatabase()
      .then((db) => {
        dbRef.current = db;
        setDbInitialized(true); // Mark the database as initialized
      })
      .catch((error) => {
        console.error("Failed to initialize database", error);
      });
  }, []);

  const queryFn = async <T extends CacheData>(
    params: LocalCacheQueryParams
  ): Promise<CacheItem<T>[]> => {
    if (dbInitialized && dbRef.current) {
      try {
        return await query<T>(dbRef.current, params);
      } catch (error) {
        console.error("Query function failed", error);
        throw error;
      }
    } else {
      const errorMessage = "Database not initialized or not ready";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const storeFn = async <T extends CacheData>(
    items: CacheItem<T>[]
  ): Promise<boolean> => {
    if (dbInitialized && dbRef.current) {
      try {
        return await store(dbRef.current, items);
      } catch (error) {
        console.error("Store function failed", error);
        throw error;
      }
    } else {
      const errorMessage = "Database not initialized or not ready";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const removeFn = async (items: CacheItemId[]): Promise<boolean> => {
    if (dbInitialized && dbRef.current) {
      try {
        return await remove(dbRef.current, items);
      } catch (error) {
        console.error("Remove function failed", error);
        throw error;
      }
    } else {
      const errorMessage = "Database not initialized or not ready";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearStaleFn = async (
    type: string,
    staleDuration: number
  ): Promise<void> => {
    if (dbInitialized && dbRef.current) {
      try {
        const items = await query<CacheData>(dbRef.current, {
          type,
          staleDuration,
        });

        const staleItems = items.map((item) => item.value.id);

        await remove(
          dbRef.current,
          staleItems.map((id) => ({ type, id }))
        );
      } catch (error) {
        console.error("Clear stale function failed", error);
        throw error;
      }
    } else {
      const errorMessage = "Database not initialized or not ready";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <LocalCacheContext.Provider
      value={{
        query: queryFn,
        store: storeFn,
        remove: removeFn,
        clearStale: clearStaleFn,
      }}
    >
      {children}
    </LocalCacheContext.Provider>
  );
};

export const useLocalCache = (): LocalCacheContextType => {
  const context = useContext(LocalCacheContext);
  if (!context) {
    const errorMessage =
      "useLocalCache must be used within a LocalCacheProvider";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  return context;
};

export type UseLocalCacheParams = Omit<LocalCacheQueryParams, "type">;

export const useLoadLocalCache = <T extends CacheData>(
  type: string,
  params: UseLocalCacheParams | undefined = {}
) => {
  const { query } = useLocalCache();

  return useQuery<T[]>({
    queryKey: [type, params],
    queryFn: async () => {
      const items = await query<T>({
        type,
        ...params,
      });

      return items.map((item) => item.value);
    },
  });
};

export const useStoreLocalCache = <T extends CacheData>(type: string) => {
  const { store } = useLocalCache();

  return useMutation({
    mutationFn: async (items: T[]) => {
      const now = new Date();

      await store<T>(
        items.map((item) => ({
          type: type,
          value: item,
          updated: now,
        }))
      );
    },
  });
};
