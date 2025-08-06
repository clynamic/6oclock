import { useCallback, useMemo } from 'react';

import {
  Close,
  HourglassEmpty,
  Inventory,
  NewReleasesOutlined,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import { LoadingHint } from '../common/LoadingHint';
import { QueryHint } from '../common/QueryHint';
import { DashboardCard } from './DashboardCard';
import { useDashboard } from './DashboardContext';
import { DashboardGrid } from './DashboardGrid';

export const DashboardBody = () => {
  const {
    config,
    layouts,
    currentLayout,
    catalog,
    version,
    setConfig,
    saveConfig,
    resetConfig,
    isLoading,
    error,
    available,
  } = useDashboard();

  const resetDashboard = useCallback(() => {
    resetConfig();
  }, [resetConfig]);

  const ignoreVersionChange = useCallback(() => {
    saveConfig({
      ...config,
      version: version,
    });
  }, [config, saveConfig, version]);

  const isUnavailable = useMemo(() => {
    if (!available) return false;
    const values = Object.values(available).filter(
      (v): v is number => typeof v === 'number',
    );
    return values.length > 0 && values.every((value) => value < 0.5);
  }, [available]);

  return (
    <QueryHint
      isLoading={isLoading}
      error={error}
      skeleton={<LoadingHint message="Loading dashboard..." />}
    >
      <Stack direction="column" gap={2} sx={{ height: '100%', width: '100%' }}>
        {config?.version && version && config?.version < version && (
          <Alert
            sx={{ margin: 1 }}
            severity="info"
            icon={<NewReleasesOutlined />}
            action={
              <Stack direction="row" gap={1}>
                <Button color="inherit" size="small" onClick={resetDashboard}>
                  Reset
                </Button>
                <IconButton size="small" onClick={ignoreVersionChange}>
                  <Close />
                </IconButton>
              </Stack>
            }
          >
            <Typography variant="subtitle2">
              New dashboard widgets are available. Reset your dashboard?
            </Typography>
          </Alert>
        )}
        {isUnavailable ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
              p: 2,
            }}
          >
            <Inventory sx={{ fontSize: 48 }} />
            <Typography variant="h6">
              The data for this dashboard is not available.
            </Typography>
            <Typography variant="caption">
              If you believe this is an error, please contact your
              administrator.
            </Typography>
          </Box>
        ) : currentLayout?.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
              p: 2,
            }}
          >
            <HourglassEmpty sx={{ fontSize: 48 }} />
            <Typography variant="h6">Your dashboard is empty</Typography>
            <Typography variant="caption">
              Use the items menu to add components to your dashboard
            </Typography>
          </Box>
        ) : (
          <DashboardGrid
            compactType={'vertical'}
            layouts={layouts}
            onLayoutChange={(_, allLayouts) => {
              if (!config) return;
              setConfig({
                ...config,
                positions: allLayouts,
              });
            }}
          >
            {currentLayout?.map((layout) => {
              if (catalog[layout.i] === undefined) return null;
              const { component: Component, card, items } = catalog[layout.i];
              return (
                <DashboardCard key={layout.i} {...card} items={items}>
                  <Component />
                </DashboardCard>
              );
            })}
          </DashboardGrid>
        )}
      </Stack>
    </QueryHint>
  );
};
