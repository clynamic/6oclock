import {
  Close,
  HourglassEmpty,
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
import { useCallback } from 'react';

import { QueryHint } from '../common';
import { LoadingHint } from '../common/LoadingHint';
import { DashboardCard } from './DashboardCard';
import { useDashboard } from './DashboardContext';
import { DashboardGrid } from './DashboardGrid';
import { buildCatalogLayouts } from './DashboardItem';

export const DashboardBody = () => {
  const {
    config,
    layouts,
    currentLayout,
    catalog,
    version,
    setConfig,
    saveConfig,
    isLoading,
    error,
  } = useDashboard();

  const updateDashboard = useCallback(() => {
    saveConfig({
      positions: buildCatalogLayouts(catalog),
      version: version,
    });
  }, [catalog, saveConfig, version]);

  const ignoreVersionChange = useCallback(() => {
    saveConfig({
      ...config,
      version: version,
    });
  }, [config, saveConfig, version]);

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
                <Button color="inherit" size="small" onClick={updateDashboard}>
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
        {currentLayout?.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
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
              const { component: Component, card } = catalog[layout.i];
              return (
                <DashboardCard key={layout.i} {...card}>
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
