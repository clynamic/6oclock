/* eslint-disable react-refresh/only-export-components */
import { BarChart, LineChart } from '@mui/x-charts';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { UserArea } from '../api';
import { DateRange, getCurrentMonthRange } from './months';

export type SeriesChartProps = Parameters<typeof BarChart>[0] &
  Parameters<typeof LineChart>[0];

export interface ChartParams {
  range: DateRange;
  userId?: number;
  area?: UserArea;
}

interface ChartParamsContextValue {
  params: ChartParams;
  setParams: (params: ChartParams) => void;
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
  const [value, setValue] = useState<ChartParams>({
    range: getCurrentMonthRange(),
    ...params,
  });

  useEffect(() => {
    setValue({
      range: getCurrentMonthRange(),
      ...params,
    });
  }, [params]);

  return (
    <ChartParamsContext.Provider
      value={{
        params: value,
        setParams: setValue,
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
  const value = useChartParamsValue();

  return (
    <ChartParamsProvider params={{ ...value, ...params }}>
      {children}
    </ChartParamsProvider>
  );
};

export const useChartParams = (): ChartParamsContextValue => {
  const context = useContext(ChartParamsContext);
  if (!context) {
    throw new Error('useChartDate must be used within a ChartDateProvider');
  }
  return context;
};

export const useChartParamsValue = (): ChartParams => {
  return useChartParams().params;
};

export const useChartDateRange = (): DateRange => {
  return useChartParams().params.range;
};
