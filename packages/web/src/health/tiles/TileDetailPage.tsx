import { useState } from 'react';

import { Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useParams } from 'react-router';

import {
  TileType,
  getTileHealthQueryKey,
  useDeleteTilesByType,
  useTileHealthInfinite,
} from '../../api';
import { FactCell, FactList } from '../../common/FactList';
import { LoadMoreHint } from '../../common/LoadMoreHint';
import { QueryHint } from '../../common/QueryHint';
import { Page } from '../../page/Page';
import { PageBody } from '../../page/PageBody';
import { PageFooter } from '../../page/PageFooter';
import { PageTitle } from '../../page/PageTitle';
import { PageHeader } from '../../page/header/PageHeader';
import { SliceStrip } from '../SliceStrip';
import { sliceColor } from '../slice';

const PAGE_SIZE = 12;

export const TileDetailPage: React.FC = () => {
  const type = useParams()['type'] as TileType;
  const queryClient = useQueryClient();

  const [confirming, setConfirming] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

  const health = useTileHealthInfinite(
    {
      limit: PAGE_SIZE,
      startDate: from ?? undefined,
      endDate: to ?? undefined,
    },
    {
      query: {
        refetchInterval: 30000,
        initialPageParam: undefined,
        getNextPageParam: (last) => {
          const read = last.find((item) => item.type === type)?.months ?? [];

          return read.length < PAGE_SIZE
            ? undefined
            : read[read.length - 1]!.startDate.toISOString();
        },
      },
    },
  );
  const pages = health.data?.pages ?? [];

  const tile = pages[0]?.find((item) => item.type === type);

  const read = pages.flatMap(
    (page) => page.find((item) => item.type === type)?.months ?? [],
  );

  const { mutateAsync: wipe } = useDeleteTilesByType();

  const months = read;

  const dropSelected = async () => {
    for (const key of selected) {
      const month = months.find(
        (item) => new Date(item.startDate).toISOString() === key,
      );
      if (!month) continue;

      await wipe({
        type,
        params: { startDate: month.startDate, endDate: month.endDate },
      });
    }

    setConfirming(false);
    setSelected([]);
    await queryClient.invalidateQueries({ queryKey: getTileHealthQueryKey() });
  };

  const visible = months.map((month) =>
    new Date(month.startDate).toISOString(),
  );

  const allVisible =
    visible.length > 0 && visible.every((key) => selected.includes(key));

  const toggleVisible = () =>
    setSelected(
      allVisible
        ? selected.filter((key) => !visible.includes(key))
        : [...new Set([...selected, ...visible])],
    );

  const toggle = (key: string) =>
    setSelected((previous) =>
      previous.includes(key)
        ? previous.filter((item) => item !== key)
        : [...previous, key],
    );

  const missing = tile ? tile.expected - tile.actual : 0;

  return (
    <Page>
      <PageTitle subtitle={type} />
      <PageHeader />
      <PageBody>
        <Box
          sx={{
            width: '100%',
            maxWidth: 1200,
            marginInline: 'auto',
            p: 2,
            alignSelf: 'flex-start',
          }}
        >
          <QueryHint
            data={read}
            isLoading={health.isLoading}
            isEmpty={!health.isLoading && !tile}
            error={health.error}
          >
            <Stack sx={{ gap: 2 }}>
              <Card sx={{ p: 2 }}>
                <Stack sx={{ gap: 1 }}>
                  <Typography variant="h6">{type}</Typography>
                  <SliceStrip
                    slices={tile?.slices}
                    height={24}
                    label={(slice) =>
                      `${format(slice.startDate, 'PP')} to ${format(
                        slice.endDate,
                        'PP',
                      )}: ${Math.round(slice.available)} of ${Math.round(
                        slice.available + slice.unavailable,
                      )} tiles`
                    }
                  />
                  <FactList
                    facts={[
                      {
                        label: 'Covers',
                        value: tile
                          ? `${format(tile.startDate, 'PP')} to ${format(tile.endDate, 'PP')}`
                          : undefined,
                      },
                      { label: 'Ranges', value: tile?.ranges.toString() },
                      {
                        label: 'Tiles',
                        value: tile
                          ? `${tile.actual.toLocaleString()} of ${tile.expected.toLocaleString()}`
                          : undefined,
                      },
                      { label: 'Missing', value: missing.toLocaleString() },
                    ]}
                  />
                </Stack>
              </Card>

              <Card
                sx={{
                  p: 1.5,
                  ...(selected.length
                    ? { position: 'sticky', top: 8, zIndex: 2 }
                    : {}),
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Stack
                    direction="row"
                    sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <DatePicker
                      label="From"
                      value={from}
                      onChange={setFrom}
                      slotProps={{
                        textField: { size: 'small' },
                        field: { clearable: true },
                      }}
                    />
                    <DatePicker
                      label="To"
                      value={to}
                      onChange={setTo}
                      slotProps={{
                        textField: { size: 'small' },
                        field: { clearable: true },
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }} />
                    {selected.length ? (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {`${selected.length} selected`}
                        </Typography>
                        <Button
                          color="secondary"
                          onClick={() => setSelected([])}
                        >
                          Clear
                        </Button>
                        <Button
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => setConfirming(true)}
                        >
                          Wipe
                        </Button>
                      </>
                    ) : null}
                    <Tooltip
                      title={
                        allVisible
                          ? 'Deselect all visible'
                          : 'Select all visible'
                      }
                    >
                      <Checkbox
                        checked={allVisible}
                        indeterminate={
                          !allVisible &&
                          visible.some((key) => selected.includes(key))
                        }
                        onChange={toggleVisible}
                      />
                    </Tooltip>
                  </Stack>
                </LocalizationProvider>
              </Card>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'auto auto auto 1fr',
                  gap: 1,
                }}
              >
                {months.map((month) => {
                  const key = new Date(month.startDate).toISOString();
                  const held = Math.round(month.available);
                  const owed = Math.round(month.available + month.unavailable);

                  return (
                    <Card
                      key={key}
                      sx={{
                        gridColumn: '1 / -1',
                        display: 'grid',
                        gridTemplateColumns: 'subgrid',
                        borderLeft: '4px solid',
                        borderLeftColor: sliceColor(month, false),
                      }}
                    >
                      <CardActionArea
                        onClick={() => toggle(key)}
                        sx={{
                          gridColumn: '1 / -1',
                          display: 'grid',
                          gridTemplateColumns: 'subgrid',
                          alignItems: 'center',
                          columnGap: 4,
                          p: 2,
                        }}
                      >
                        <FactCell
                          label="Month"
                          value={format(month.startDate, 'MMMM yyyy')}
                        />
                        <FactCell
                          label="Tiles"
                          value={`${held.toLocaleString()} of ${owed.toLocaleString()}`}
                        />
                        <FactCell
                          label="Missing"
                          value={Math.round(month.unavailable).toLocaleString()}
                        />
                        <Checkbox
                          checked={selected.includes(key)}
                          tabIndex={-1}
                          disableRipple
                          sx={{ p: 0, justifySelf: 'end' }}
                        />
                      </CardActionArea>
                    </Card>
                  );
                })}
              </Box>

              <LoadMoreHint query={health} />
            </Stack>
          </QueryHint>
        </Box>

        <Dialog open={confirming} onClose={() => setConfirming(false)}>
          <DialogTitle>
            {`Wipe ${selected.length} months of ${type}?`}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              The tiling job recreates them from their source data.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirming(false)}>Cancel</Button>
            <Button color="error" onClick={dropSelected}>
              Wipe
            </Button>
          </DialogActions>
        </Dialog>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
