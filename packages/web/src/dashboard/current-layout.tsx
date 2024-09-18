import { useMemo } from 'react';

import { useCurrentBreakpoint } from '../utils';
import { DashboardLayout, DashboardLayouts } from './DashboardGrid';

export const useCurrentLayout = (
  layouts?: DashboardLayouts,
): DashboardLayout[] | undefined => {
  const currentBreakpoint = useCurrentBreakpoint();
  const currentLayout = useMemo(() => {
    if (!layouts || !currentBreakpoint) return undefined;
    return layouts[currentBreakpoint];
  }, [currentBreakpoint, layouts]);

  return currentLayout;
};
