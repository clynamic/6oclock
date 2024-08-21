import { useMediaQuery, useTheme } from "@mui/material";

export const useCurrentBreakpoint = () => {
  const theme = useTheme();

  const breakpoints = theme.breakpoints.keys;

  const currentBreakpoint = breakpoints
    .map((breakpoint) => ({
      breakpoint,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      matches: useMediaQuery(theme.breakpoints.up(breakpoint)),
    }))
    .reverse()
    .find((item) => item.matches)?.breakpoint;

  return currentBreakpoint;
};
