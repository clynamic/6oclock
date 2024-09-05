import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useCurrentBreakpoint } from "../utils";

export interface TopNavigationEntry {
  label: React.ReactNode;
  href: string;
  children?: SubNavigationEntry[];
}

export interface SubNavigationEntry {
  label: React.ReactNode;
  href?: string;
}

export interface PageHeaderProps {
  actions?: SubNavigationEntry[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({ actions }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigation: TopNavigationEntry[] = useMemo(
    () => [
      {
        label: "Mods",
        href: "/mods",
        children: [
          {
            label: "Dashboard",
            href: "/mods",
          },
          {
            label: "Tickets",
            href: "/mods/tickets",
          },
        ],
      },
      {
        label: "Janitors",
        href: "/janitors",
        children: [
          {
            label: "Dashboard",
            href: "/janitors",
          },
        ],
      },
    ],
    []
  );

  const subentries = useMemo(() => {
    let result: SubNavigationEntry[] | undefined;
    const segments = location.pathname.split("/");
    const entry = navigation.find((entry) =>
      entry.href
        .split("/")
        .every((segment, index) => segments[index] === segment)
    );
    if (entry) {
      result = entry.children;
    }
    if (actions) {
      result = [...(result || []), ...actions];
    }
    return result;
  }, [actions, location.pathname, navigation]);

  const currentBreakpoint = useCurrentBreakpoint();
  const useAppbar = ["xs", "sm"].includes(currentBreakpoint);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const currentTopNavLabel = useMemo(() => {
    const entry = navigation.find((nav) =>
      location.pathname.startsWith(nav.href)
    );
    return entry?.label || "";
  }, [location.pathname, navigation]);

  return (
    <ThemeProvider
      theme={(theme) => ({
        ...theme,
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
              },
            },
          },
        },
      })}
    >
      {useAppbar ? (
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: "background.paper",
            borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
            borderBottomRightRadius: (theme) => theme.shape.borderRadius,
            marginBottom: 1,
          }}
        >
          <Toolbar
            sx={{
              gap: 1,
            }}
          >
            <Button
              variant="text"
              color="secondary"
              size="small"
              onClick={() => navigate("/")}
              sx={{
                color: "text.primary",
              }}
            >
              <Typography variant="h4" whiteSpace={"nowrap"}>
                6o
              </Typography>
            </Button>
            <Button
              variant="text"
              color="secondary"
              size="small"
              sx={{
                flex: 1,
              }}
              onClick={handleMenuOpen}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{
                  width: "100%",
                }}
              >
                <Typography variant="h6">{currentTopNavLabel}</Typography>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenuOpen}
                >
                  <MenuIcon />
                </IconButton>
              </Stack>
            </Button>
          </Toolbar>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{
              width: "100%",
            }}
          >
            {navigation.map((entry) => (
              <MenuItem
                key={entry.href}
                sx={{
                  width: "100%",
                }}
                onClick={() => {
                  navigate(entry.href);
                  handleMenuClose();
                }}
              >
                {entry.label}
              </MenuItem>
            ))}
            <Box
              sx={{
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            />
            {/* Sub navigation for the current top nav */}
            {subentries?.map((entry, i) =>
              entry.href ? (
                <MenuItem
                  key={entry.href ?? i}
                  onClick={() => {
                    navigate(entry.href!);
                    handleMenuClose();
                  }}
                >
                  {entry.label}
                </MenuItem>
              ) : (
                <Typography key={i}>{entry.label}</Typography>
              )
            )}
          </Menu>
        </AppBar>
      ) : (
        <Box
          sx={{
            borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
            borderBottomRightRadius: (theme) => theme.shape.borderRadius,
            marginBottom: 1,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="text"
              color="secondary"
              size="small"
              onClick={() => navigate("/")}
              sx={{
                color: "text.primary",
                height: "100%",
              }}
            >
              <Typography variant="h4" whiteSpace={"nowrap"}>
                6o
              </Typography>
            </Button>
            <Stack
              direction="column"
              sx={{
                paddingTop: 0.5,
                paddingBottom: 0.5,
                flexBasis: "100%",
              }}
            >
              <Stack
                direction="row"
                gap={2}
                sx={{
                  paddingLeft: 0.5,
                  paddingRight: 0.5,
                  width: "100%",
                }}
              >
                <ThemeProvider
                  theme={(theme) => ({
                    ...theme,
                    components: {
                      MuiButton: {
                        defaultProps: {
                          variant: "text",
                          size: "small",
                          color: "secondary",
                        },
                        styleOverrides: {
                          root: {
                            textTransform: "none",
                            p: 0.2,
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                          },
                        },
                      },
                    },
                  })}
                >
                  {navigation.map((entry) => {
                    const selected =
                      location.pathname === entry.href ||
                      (entry.children &&
                        entry.children.some(
                          (child) => location.pathname === child.href
                        ));
                    return (
                      <Button
                        key={entry.href}
                        sx={{
                          backgroundColor: selected
                            ? "background.paper"
                            : undefined,
                        }}
                        onClick={() => navigate(entry.href)}
                      >
                        <Typography>{entry.label}</Typography>
                      </Button>
                    );
                  })}
                </ThemeProvider>
              </Stack>
              <Stack
                direction="row"
                gap={2}
                sx={{
                  backgroundColor: "background.paper",
                  borderRadius: 1,
                  paddingLeft: 2,
                  paddingRight: 2,
                }}
              >
                {subentries?.map(
                  (entry, i) =>
                    (entry.href && (
                      <Button
                        variant="text"
                        size="small"
                        color="secondary"
                        key={entry.href ?? i}
                        sx={{
                          p: 0.2,
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                        }}
                        onClick={() => navigate(entry.href!)}
                      >
                        <Typography>{entry.label}</Typography>
                      </Button>
                    )) ||
                    entry.label
                ) || (
                  <Box
                    sx={{
                      height: (theme) => theme.spacing(3.4),
                    }}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
        </Box>
      )}
    </ThemeProvider>
  );
};
