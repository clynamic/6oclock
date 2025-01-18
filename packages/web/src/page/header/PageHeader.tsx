import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Backdrop,
  Box,
  Button,
  Divider,
  Menu,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { Fragment } from 'react/jsx-runtime';
import { Link as RouterLink } from 'react-router-dom';

import { AppLogo } from '../../common';
import {
  NavAction,
  resolveNavLinks,
  useNavigationEntries,
} from '../navigation';
import { NavLink } from './NavLink';
import { PageHeaderProvider, usePageHeaderContext } from './PageHeaderContext';

export interface PageHeaderProps {
  actions?: NavAction[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({ actions }) => {
  const allEntries = useNavigationEntries();
  const entries = resolveNavLinks(allEntries);

  return (
    <PageHeaderProvider navigation={entries} actions={actions}>
      <PageHeaderBar />
    </PageHeaderProvider>
  );
};

const PageHeaderBar: React.FC = () => {
  const pageHeaderContext = usePageHeaderContext();
  const { layout, navigation, currentLink, currentSubLinks } =
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
                {navigation
                  .filter((entry) => {
                    if (entry instanceof Object && 'href' in entry) {
                      return !entry.hidden;
                    }
                    return true;
                  })
                  .map((entry) => {
                    if (entry instanceof Object && 'href' in entry) {
                      return (
                        <NavLink
                          key={entry.href}
                          href={entry.href}
                          label={entry.label}
                          // This doesnt look good and isn't necessary.
                          // selected={entry === currentLink}
                        />
                      );
                    }
                    return entry;
                  })}
                {currentSubLinks && currentSubLinks.length > 0 && (
                  <Divider
                    key="subnav-divider"
                    orientation="horizontal"
                    variant="middle"
                  />
                )}
                {currentSubLinks
                  ?.filter((entry) => {
                    if (entry instanceof Object && 'href' in entry) {
                      return !entry.hidden;
                    }
                    return true;
                  })
                  .map((entry) => {
                    if (entry instanceof Object && 'href' in entry) {
                      return (
                        <NavLink
                          key={`subnav-${entry.href}`}
                          href={entry.href}
                          label={entry.label}
                        />
                      );
                    }
                    return entry;
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
      <Box sx={{ marginBottom: 1 }}>
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
              {navigation
                .filter((entry) => {
                  if (entry instanceof Object && 'href' in entry) {
                    return !entry.hidden;
                  }
                  return true;
                })
                .map((entry, i) => {
                  if (entry instanceof Object && 'href' in entry) {
                    return (
                      <NavLink
                        key={i}
                        component={RouterLink}
                        href={entry.href}
                        label={entry.label}
                        selected={entry === currentLink}
                      />
                    );
                  }
                  return <Fragment key={`nav-action-${i}`}>{entry}</Fragment>;
                })}
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
              <Box
                key="empty-subnav"
                sx={{
                  height: (theme) => theme.spacing(3.4),
                }}
              />
              {currentSubLinks &&
                currentSubLinks.length > 0 &&
                currentSubLinks
                  .filter((entry) => {
                    if (entry instanceof Object && 'href' in entry) {
                      return !entry.hidden;
                    }
                    return true;
                  })
                  .map((entry, i) => {
                    if (entry instanceof Object && 'href' in entry) {
                      return (
                        <NavLink
                          key={`subnav-${entry.href}`}
                          href={entry.href}
                          label={entry.label}
                          variant={'sub'}
                        />
                      );
                    }
                    return (
                      <Fragment key={`subnav-action-${i}`}>{entry}</Fragment>
                    );
                  })}
            </Stack>
          </Stack>
        </Stack>
      </Box>
    );
  }
};
