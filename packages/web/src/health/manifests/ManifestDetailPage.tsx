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
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { useParams } from 'react-router';

import {
  ItemType,
  TimeScale,
  getListManifestsQueryKey,
  useDeleteManifest,
  useListManifestsInfinite,
  useManifestHealth,
} from '../../api';
import { FactCell, FactList } from '../../common/FactList';
import { LoadMoreHint } from '../../common/LoadMoreHint';
import { QueryHint } from '../../common/QueryHint';
import { Page } from '../../page/Page';
import { PageBody } from '../../page/PageBody';
import { PageFooter } from '../../page/PageFooter';
import { PageTitle } from '../../page/PageTitle';
import { PageHeader } from '../../page/header/PageHeader';
import { SliceStrip, sliceState } from '../SliceStrip';

const PAGE_SIZE = 50;

const OPEN_START = new Date(0);
const OPEN_END = new Date('3000-01-01T00:00:00Z');

export const ManifestDetailPage: React.FC = () => {
  const type = useParams()['type'] as ItemType;
  const queryClient = useQueryClient();
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  const health = useManifestHealth({ query: { refetchInterval: 30000 } });
  const manifest = health.data?.find((item) => item.type === type);

  const parts = useListManifestsInfinite(
    {
      scale: TimeScale.decade,
      cycle: TimeScale.decade,
      type: [type],
      limit: PAGE_SIZE,
      // One open end claims no range at all, so an unset end opens all the way
      // rather than tracking the coverage, which moves as the sync advances.
      startDate: from ?? (to ? OPEN_START : undefined),
      endDate: to ?? (from ? OPEN_END : undefined),
    },
    {
      query: {
        initialPageParam: undefined,
        getNextPageParam: (last) => {
          const edge = last[last.length - 1];

          return last.length < PAGE_SIZE || !edge
            ? undefined
            : `${edge.startDate.toISOString()}|${edge.id}`;
        },
      },
    },
  );

  const { mutateAsync: remove } = useDeleteManifest();

  const loaded = parts.data?.pages.flat() ?? [];

  const sorted = [...loaded].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  // A filtered list would read its own missing rows as holes.
  const broken = new Set(
    sorted
      .filter((part, index) => {
        const older = sorted[index + 1];
        return !!older && new Date(older.endDate) < new Date(part.startDate);
      })
      .map((part) => part.id),
  );

  const ordered = sorted;

  // The oldest row loaded has no successor to be contiguous with yet.
  const trailing = parts.hasNextPage
    ? sorted[sorted.length - 1]?.id
    : undefined;

  const dropSelected = async () => {
    for (const id of selected) {
      await remove({ id });
    }

    setConfirming(false);
    setSelected([]);
    await queryClient.invalidateQueries({
      queryKey: getListManifestsQueryKey(),
    });
  };

  const visible = ordered.map((part) => part.id);

  const allVisible =
    visible.length > 0 && visible.every((key) => selected.includes(key));

  const toggleVisible = () =>
    setSelected(
      allVisible
        ? selected.filter((key) => !visible.includes(key))
        : [...new Set([...selected, ...visible])],
    );

  const toggle = (id: number) =>
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );

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
          <Stack sx={{ gap: 2 }}>
            <Card sx={{ p: 2 }}>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="h6">{type}</Typography>
                <SliceStrip
                  slices={manifest?.slices}
                  porous={manifest?.porous}
                  height={24}
                  label={(slice) =>
                    `${format(slice.startDate, 'PP')} to ${format(
                      slice.endDate,
                      'PP',
                    )}: ${sliceState(slice)}`
                  }
                />
                <FactList
                  facts={[
                    {
                      label: 'Covers',
                      value: manifest
                        ? `${Math.round(manifest.covered)} of ${Math.round(manifest.reach)} days`
                        : undefined,
                    },
                    { label: 'Parts', value: manifest?.parts.toString() },
                    { label: 'Gaps', value: manifest?.gaps.toString() },
                    {
                      label: 'Ids',
                      value: manifest?.porous ? 'porous' : 'contiguous',
                    },
                    {
                      label: 'Synced',
                      value: manifest
                        ? formatDistanceToNow(manifest.updatedAt, {
                            addSuffix: true,
                          })
                        : undefined,
                    },
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
                      <Button color="secondary" onClick={() => setSelected([])}>
                        Clear
                      </Button>
                      <Button
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => setConfirming(true)}
                      >
                        Delete
                      </Button>
                    </>
                  ) : null}
                  <Tooltip
                    title={
                      allVisible ? 'Deselect all visible' : 'Select all visible'
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

            <QueryHint
              data={loaded}
              isLoading={parts.isLoading}
              isEmpty={!loaded.length}
              error={parts.error}
              skeleton={
                <Stack sx={{ gap: 1 }}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} height={64} variant="rounded" />
                  ))}
                </Stack>
              }
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'auto auto auto 1fr',
                  gap: 1,
                }}
              >
                {ordered.map((part) => (
                  <Card
                    key={part.id}
                    sx={{
                      gridColumn: '1 / -1',
                      display: 'grid',
                      gridTemplateColumns: 'subgrid',
                      borderLeft: '4px solid',
                      borderLeftColor:
                        part.id === trailing
                          ? 'divider'
                          : broken.has(part.id)
                            ? manifest?.porous
                              ? 'success.light'
                              : 'warning.main'
                            : 'success.main',
                    }}
                  >
                    <CardActionArea
                      onClick={() => toggle(part.id)}
                      sx={{
                        gridColumn: '1 / -1',
                        display: 'grid',
                        gridTemplateColumns: 'subgrid',
                        alignItems: 'center',
                        columnGap: 4,
                        p: 2,
                      }}
                    >
                      <FactCell label="Range" value={`#${part.id}`} />
                      <FactCell
                        label="Covers"
                        value={`${format(part.startDate, 'PP')} to ${format(part.endDate, 'PP')}`}
                      />
                      <FactCell
                        label="Ids"
                        value={`${part.lowerId} to ${part.upperId}`}
                      />
                      <Checkbox
                        checked={selected.includes(part.id)}
                        tabIndex={-1}
                        disableRipple
                        sx={{ p: 0, justifySelf: 'end' }}
                      />
                    </CardActionArea>
                  </Card>
                ))}
              </Box>

              <LoadMoreHint query={parts} />
            </QueryHint>
          </Stack>
        </Box>

        <Dialog open={confirming} onClose={() => setConfirming(false)}>
          <DialogTitle>
            {`Delete ${selected.length} ranges of ${type}?`}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              The sync jobs fetch them again from upstream.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirming(false)}>Cancel</Button>
            <Button color="error" onClick={dropSelected}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
