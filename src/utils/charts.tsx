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
  const [value, setValue] = useState<ChartParams>({
    ...defaultParams,
    ...params,
  });

  const resetParams = useCallback(() => {
    setValue({
      ...defaultParams,
      ...params,
    });
  }, [defaultParams, params]);

  useEffect(() => {
    setValue({
      ...defaultParams,
      ...params,
    });
  }, [defaultParams, params]);

  return (
    <ChartParamsContext.Provider
      value={{
        params: value,
        setParams: setValue,
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
