import {
  Box,
  Button,
  Stack,
  ThemeProvider,
  Typography,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

interface TopNavigationEntry {
  label: React.ReactNode;
  href: string;
  children?: SubNavigationEntry[];
}

interface SubNavigationEntry {
  label: React.ReactNode;
  href?: string;
}

export const PageHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigation: TopNavigationEntry[] = [
    {
      label: "Mods",
      href: "/mods",
      children: [
        {
          label: "Dashboard",
          href: "/mods",
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
  ];

  const outerTheme = useTheme();

  return (
    <ThemeProvider
      theme={{
        ...outerTheme,
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
              },
            },
          },
        },
      }}
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
              gap={0.5}
              sx={{
                paddingLeft: 0.5,
                paddingRight: 0.5,
                width: "100%",
              }}
            >
              {navigation.map((entry) => {
                const selected = location.pathname === entry.href;
                return (
                  <Button
                    variant="text"
                    size="small"
                    color="secondary"
                    key={entry.href}
                    sx={{
                      p: 0.2,
                      backgroundColor: selected
                        ? "background.paper"
                        : undefined,
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                    onClick={() => navigate(entry.href)}
                  >
                    <Typography>{entry.label}</Typography>
                  </Button>
                );
              })}
            </Stack>
            <Stack
              direction="row"
              gap={0.5}
              sx={{
                backgroundColor: "background.paper",
                borderRadius: 1,
                paddingLeft: 2,
                paddingRight: 2,
              }}
            >
              {navigation
                .find((entry) => {
                  const segments = location.pathname.split("/");
                  const entrySegments = entry.href.split("/");
                  return entrySegments.every(
                    (segment, index) => segments[index] === segment,
                  );
                })
                ?.children?.map((entry) => {
                  return (
                    (entry.href && (
                      <Button
                        variant="text"
                        size="small"
                        color="secondary"
                        key={entry.href}
                        sx={{
                          p: 0.2,
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                        }}
                        onClick={() => navigate(entry.href!)}
                      >
                        <Typography>{entry.label}</Typography>
                      </Button>
                    )) || <>{entry.label}</>
                  );
                }) || (
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
