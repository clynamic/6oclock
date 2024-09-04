import { Box, Button, Stack, ThemeProvider, Typography } from "@mui/material";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
    </ThemeProvider>
  );
};
