/* eslint-disable react-refresh/only-export-components */
import { BarChart, LineChart } from "@mui/x-charts";
import { createContext, useContext, useEffect, useState } from "react";

import { DateRange, getCurrentMonthRange } from "./months";

export type SeriesChartProps = Parameters<typeof BarChart>[0] &
  Parameters<typeof LineChart>[0];

interface ChartDateContextValue {
  range: DateRange;
  setRange?: (range: DateRange) => void;
}

const ChartDateContext = createContext<ChartDateContextValue>({
  range: getCurrentMonthRange(),
});

export interface ChartDateProviderProps {
  range?: DateRange;
  children: React.ReactNode;
}

export const ChartDateProvider: React.FC<ChartDateProviderProps> = ({
  range,
  children,
}) => {
  const [value, setValue] = useState(range ?? getCurrentMonthRange());

  useEffect(() => {
    if (range) {
      setValue(range);
    } else {
      setValue(getCurrentMonthRange());
    }
  }, [range]);

  return (
    <ChartDateContext.Provider
      value={{
        range: value,
        setRange: setValue,
      }}
    >
      {children}
    </ChartDateContext.Provider>
  );
};

export const useChartDate = (): ChartDateContextValue => {
  return useContext(ChartDateContext);
};

export const useChartDateRange = (): DateRange => {
  return useChartDate().range;
};
