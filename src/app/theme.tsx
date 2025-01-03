import { createTheme } from '@mui/material/styles';

const hexagonColors = {
  background: '#020f23', // $hexagon-color-background
  foreground: '#152f56', // $hexagon-color-foreground
  section: '#1f3c67', // $hexagon-color-section
  text: '#ffffff', // $hexagon-color-text
  textMuted: '#999999', // $hexagon-color-text-muted
  primary: '#e8c446', // --color-button-active
  primaryLight: '#f5e5ae', // shifted from primary
  primaryDark: '#e1ac00', // shifted from primary
  secondary: '#b4c7d9', // $hexagon-color-link, used as secondary
  secondaryLight: '#cedeec', // shifted from secondary
  secondaryDark: '#839db5', // shifted from secondary
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: hexagonColors.background,
      // paper: hexagonColors.section,
      paper: hexagonColors.foreground,
    },
    primary: {
      main: hexagonColors.primary,
      light: hexagonColors.primaryLight,
      dark: hexagonColors.primaryDark,
      contrastText: hexagonColors.text,
    },
    secondary: {
      main: hexagonColors.secondary,
      light: hexagonColors.secondaryLight,
      dark: hexagonColors.secondaryDark,
      contrastText: hexagonColors.text,
    },
    text: {
      primary: hexagonColors.text,
      secondary: hexagonColors.textMuted,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#000',
          color: '#fff',
        },
        arrow: {
          color: '#000',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: hexagonColors.section,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${hexagonColors.section}`,
        },
      },
    },
  },
  typography: {
    fontFamily: 'Verdana, Noto Sans, sans-serif',
  },
});
