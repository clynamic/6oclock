/* eslint-disable react-refresh/only-export-components */
import type { BarChart } from '@mui/x-charts/BarChart';
import type { LineChart } from '@mui/x-charts/LineChart';
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { UserArea } from '../api';
import { DateRange, getCurrentMonthRange } from './ranges';

export type SeriesChartProps = Parameters<typeof BarChart>[0] &
  Parameters<typeof LineChart>[0];

export interface ChartParams {
  range: DateRange;
  userId?: number;
  area?: UserArea;
}

interface ChartParamsContextValue {
  params: ChartParams;
  setParams: React.Dispatch<React.SetStateAction<ChartParams>>;
  resetParams: () => void;
}

const ChartParamsContext = createContext<ChartParamsContextValue | undefined>(
  undefined,
);

export type ChartParamsProviderProps = PropsWithChildren & {
  params?: ChartParams;
};

const CHART_PARAMS_STORAGE_KEY = 'chart_params';
const CHART_PARAMS_EXPIRY_HOURS = 24;

interface StoredChartParams {
  params: ChartParams;
  timestamp: number;
}

const saveChartParamsToStorage = (params: ChartParams) => {
  const stored: StoredChartParams = {
    params,
    timestamp: Date.now(),
  };
  localStorage.setItem(CHART_PARAMS_STORAGE_KEY, JSON.stringify(stored));
};

const loadChartParamsFromStorage = (): ChartParams | null => {
  try {
    const stored = localStorage.getItem(CHART_PARAMS_STORAGE_KEY);
    if (!stored) return null;

    const parsed: StoredChartParams = JSON.parse(stored);
    const now = Date.now();
    const hoursElapsed = (now - parsed.timestamp) / (1000 * 60 * 60);

    if (hoursElapsed > CHART_PARAMS_EXPIRY_HOURS) {
      localStorage.removeItem(CHART_PARAMS_STORAGE_KEY);
      return null;
    }

    return {
      ...parsed.params,
      range: {
        ...parsed.params.range,
        startDate: new Date(parsed.params.range.startDate),
        endDate: new Date(parsed.params.range.endDate),
      },
    };
  } catch {
    localStorage.removeItem(CHART_PARAMS_STORAGE_KEY);
    return null;
  }
};

export const ChartParamsProvider: React.FC<ChartParamsProviderProps> = ({
  params,
  children,
}) => {
  const defaultParams = useMemo(
    () => ({
      range: getCurrentMonthRange(),
    }),
    [],
  );

  const [value, setValue] = useState<ChartParams>(() => {
    const storedParams = loadChartParamsFromStorage();
    return {
      ...defaultParams,
      ...storedParams,
      ...params,
    };
  });

  const resetParams = useCallback(() => {
    const newParams = {
      ...defaultParams,
      ...params,
    };
    setValue(newParams);
    localStorage.removeItem(CHART_PARAMS_STORAGE_KEY);
  }, [defaultParams, params]);

  const setParams = useCallback(
    (newParams: React.SetStateAction<ChartParams>) => {
      setValue((prev) => {
        const updated =
          typeof newParams === 'function' ? newParams(prev) : newParams;
        saveChartParamsToStorage(updated);
        return updated;
      });
    },
    [],
  );

  useEffect(() => {
    setValue((prev) => ({
      ...defaultParams,
      ...params,
      ...prev,
    }));
  }, [defaultParams, params]);

  return (
    <ChartParamsContext.Provider
      value={{
        params: value,
        setParams,
        resetParams,
      }}
    >
      {children}
    </ChartParamsContext.Provider>
  );
};

export type ChartParamsExtraProviderProps = PropsWithChildren & {
  params?: Partial<ChartParams>;
};

export const ChartParamsExtraProvider: React.FC<
  ChartParamsExtraProviderProps
> = ({ params, children }) => {
  const parentContext = useChartContext();
  const scopedValue = useMemo<ChartParamsContextValue>(() => {
    return {
      params: { ...parentContext.params, ...params },
      setParams: parentContext.setParams,
      resetParams: parentContext.resetParams,
    };
  }, [parentContext, params]);

  return (
    <ChartParamsContext.Provider value={scopedValue}>
      {children}
    </ChartParamsContext.Provider>
  );
};

export const useChartContext = (): ChartParamsContextValue => {
  const context = useContext(ChartParamsContext);
  if (!context) {
    throw new Error('useChartDate must be used within a ChartDateProvider');
  }
  return context;
};

export const useChartValue = (): ChartParams => {
  return useChartContext().params;
};

export const useChartRange = (): DateRange => {
  return useChartContext().params.range;
};
