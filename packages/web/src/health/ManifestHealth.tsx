import {
  CalendarMonth,
  Check,
  DataUsage,
  Delete,
  ErrorOutline,
  MoreVert,
  WarningAmber,
} from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';

import {
  ManifestHealthCondition,
  useDeleteManifest,
  useManifestHealth,
} from '../api';

export const ManifestHealthDisplay: React.FC = () => {
  const { data, refetch } = useManifestHealth({
    query: {
      refetchInterval: 10000,
    },
  });
  const { mutateAsync: deleteManifest } = useDeleteManifest();

  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {data?.map((health) => (
        <PopupState
          key={health.id}
          variant="popover"
          popupId={`popup-${health.id}`}
        >
          {(popupState) => (
            <Card key={health.id} sx={{ width: '100%' }}>
              <Stack p={2} spacing={1} sx={{ width: '100%' }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ width: '100%' }}
                >
                  <Typography variant="h6">
                    {`${health.type} #${health.id}`}
                  </Typography>
                  <IconButton
                    {...bindTrigger(popupState)}
                    size="small"
                    color="secondary"
                  >
                    <MoreVert />
                  </IconButton>
                  <Menu {...bindMenu(popupState)}>
                    <MenuItem
                      onClick={() => {
                        deleteManifest({ id: health.id });
                        refetch();
                        popupState.close();
                      }}
                    >
                      <ListItemIcon>
                        <Delete />
                      </ListItemIcon>
                      <ListItemText>Delete</ListItemText>
                    </MenuItem>
                  </Menu>
                </Stack>
                <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
                  <Chip
                    icon={<CalendarMonth />}
                    label={`${DateTime.fromJSDate(health.startDate).toLocaleString()} - ${DateTime.fromJSDate(health.endDate).toLocaleString()}`}
                  />
                  <Chip
                    icon={<DataUsage />}
                    label={`${Math.round(health.coverage * 1000) / 10}% Coverage`}
                  />
                  <Chip
                    icon={
                      health.condition === ManifestHealthCondition.nominal ? (
                        <Check />
                      ) : health.condition ===
                        ManifestHealthCondition.degraded ? (
                        <WarningAmber />
                      ) : (
                        <ErrorOutline />
                      )
                    }
                    label={health.condition}
                    color={
                      health.condition === ManifestHealthCondition.nominal
                        ? 'success'
                        : health.condition === ManifestHealthCondition.degraded
                          ? 'warning'
                          : 'error'
                    }
                  />
                </Stack>
              </Stack>
            </Card>
          )}
        </PopupState>
      ))}
    </>
  );
};
