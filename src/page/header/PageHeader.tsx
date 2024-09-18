import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Backdrop,
  Box,
  Button,
  Divider,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { Fragment } from 'react/jsx-runtime';
import { Link as RouterLink } from 'react-router-dom';

import { AppLogo } from '../../common';
import { NavAction, useNavigationEntries } from '../navigation';
import { PageHeaderProvider, usePageHeaderContext } from './PageHeaderContext';

export interface PageHeaderProps {
  actions?: NavAction[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({ actions }) => {
  const navigationEntries = useNavigationEntries();

  return (
    <PageHeaderProvider navigation={navigationEntries} actions={actions}>
      <PageHeaderBar />
    </PageHeaderProvider>
  );
};

const PageHeaderBar: React.FC = () => {
  const pageHeaderContext = usePageHeaderContext();
  const { layout, navigation, navigate, currentLink, currentSubLinks } =
    pageHeaderContext;

  if (layout === 'small') {
    return (
      <PopupState variant="popover" popupId="navigation-menu">
        {(popupState) => (
          <PageHeaderProvider {...pageHeaderContext} popupState={popupState}>
            <AppBar
              position="static"
              elevation={0}
              sx={{
                backgroundColor: 'transparent',
                borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
                borderBottomRightRadius: (theme) => theme.shape.borderRadius,
                marginBottom: 1,
                marginTop: 1,
              }}
            >
              <Toolbar
                sx={{
                  gap: 1,
                }}
              >
                <AppLogo />
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    flex: 1,
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'background.paper',
                    },
                    textTransform: 'none',
                  }}
                  {...bindTrigger(popupState)}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{
                      width: '100%',
                    }}
                  >
                    <Typography variant="h6">{currentLink?.label}</Typography>
                    <MenuIcon />
                  </Stack>
                </Button>
              </Toolbar>
              <Backdrop
                open={popupState.isOpen}
                onClick={popupState.close}
                sx={{
                  zIndex: (theme) => theme.zIndex.drawer - 1,
                }}
              />
              <Menu
                {...bindMenu(popupState)}
                slotProps={{
                  paper: {
                    sx: {
                      width: popupState.anchorEl?.clientWidth,
                    },
                  },
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                {navigation.map((entry, i) => {
                  if (entry instanceof Object && 'href' in entry) {
                    return (
                      <MenuItem
                        key={`nav-${entry.href}`}
                        sx={{
                          width: '100%',
                        }}
                        onClick={() => {
                          navigate(entry.href);
                          popupState.close();
                        }}
                      >
                        {entry.label}
                      </MenuItem>
                    );
                  }
                  return <Fragment key={`nav-action-${i}`}>{entry}</Fragment>;
                })}
                {currentSubLinks && currentSubLinks.length > 0 && (
                  <Divider orientation="horizontal" variant="middle" />
                )}
                {currentSubLinks?.map((entry) => {
                  if (entry instanceof Object && 'href' in entry) {
                    return (
                      <MenuItem
                        key={`subnav-${entry.href}`}
                        onClick={() => {
                          navigate(entry.href!);
                          popupState.close();
                        }}
                      >
                        <ListItemText>{entry.label}</ListItemText>
                      </MenuItem>
                    );
                  }
                  return (
                    <Fragment key={`subnav-action-${entry}`}>{entry}</Fragment>
                  );
                })}
              </Menu>
            </AppBar>
          </PageHeaderProvider>
        )}
      </PopupState>
    );
  }
  if (layout === 'wide') {
    return (
      <ThemeProvider
        theme={(theme) => ({
          ...theme,
          components: {
            MuiButton: {
              styleOverrides: {
                root: {
                  textTransform: 'none',
                },
              },
            },
          },
        })}
      >
        <Box
          sx={{
            borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
            borderBottomRightRadius: (theme) => theme.shape.borderRadius,
            marginBottom: 1,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <AppLogo />
            <Stack
              direction="column"
              sx={{
                paddingTop: 0.5,
                paddingBottom: 0.5,
                flexBasis: '100%',
              }}
            >
              <Stack
                direction="row"
                gap={2}
                sx={{
                  paddingLeft: 0.5,
                  paddingRight: 0.5,
                  width: '100%',
                }}
              >
                <ThemeProvider
                  theme={(theme) => ({
                    ...theme,
                    components: {
                      MuiButton: {
                        defaultProps: {
                          variant: 'text',
                          size: 'small',
                          color: 'secondary',
                        },
                        styleOverrides: {
                          root: {
                            textTransform: 'none',
                            p: 0.2,
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                          },
                        },
                      },
                    },
                  })}
                >
                  {navigation.map((entry, i) => {
                    const selected = entry === currentLink;
                    if (entry instanceof Object && 'href' in entry) {
                      return (
                        <Button
                          key={i}
                          component={RouterLink}
                          to={entry.href}
                          color={'secondary'}
                          sx={{
                            backgroundColor: selected
                              ? 'background.paper'
                              : undefined,
                          }}
                        >
                          <Typography>{entry.label}</Typography>
                        </Button>
                      );
                    }
                    return <Fragment key={`nav-action-${i}`}>{entry}</Fragment>;
                  })}
                </ThemeProvider>
              </Stack>
              <Stack
                direction="row"
                gap={2}
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  paddingLeft: 2,
                  paddingRight: 2,
                }}
              >
                {currentSubLinks?.map((entry, i) => {
                  if (entry instanceof Object && 'href' in entry) {
                    return (
                      <Button
                        key={`subnav-${entry.href}`}
                        component={RouterLink}
                        to={entry.href}
                        variant="text"
                        size="small"
                        color="secondary"
                        sx={{
                          p: 0.2,
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                        }}
                      >
                        <Typography>{entry.label}</Typography>
                      </Button>
                    );
                  }
                  return (
                    <Fragment key={`subnav-action-${i}`}>{entry}</Fragment>
                  );
                }) || (
                  <Box
                    key="empty-subnav"
                    sx={{
                      height: (theme) => theme.spacing(3.4),
                    }}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </ThemeProvider>
    );
  }
};
