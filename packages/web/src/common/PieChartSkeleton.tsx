import { Box, Skeleton, Stack } from '@mui/material';

export const PieChartSkeleton: React.FC = () => {
  return (
    <Stack
      direction={'row'}
      sx={{
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <Skeleton
        variant="circular"
        sx={{
          aspectRatio: 1,
          height: '90%',
        }}
      />
      <Box sx={{ width: 150 }} />
      <Stack
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
        }}
        gap={1}
      >
        {[...Array(3)].map((_, index) => (
          <Stack direction={'row'} key={index} gap={1} alignItems={'center'}>
            <Skeleton variant="rectangular" width={20} height={20} />
            <Skeleton width={100} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};
