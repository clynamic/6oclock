import { Box, Skeleton, Stack } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

export const BarChartSkeleton: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [barHeights, setBarHeights] = useState<string[]>([]);

  const barWidth = 20;
  const barGap = 4;

  useEffect(() => {
    const ref = containerRef;

    const generateBars = () => {
      if (ref.current) {
        const containerWidth = ref.current.offsetWidth;
        const totalBarSpace = barWidth + barGap;
        const barCount = Math.floor(containerWidth / totalBarSpace);

        setBarHeights((prevHeights) => {
          if (prevHeights.length < barCount) {
            return [
              ...prevHeights,
              ...Array.from(
                { length: barCount - prevHeights.length },
                () => `${10 + Math.random() * 90}%`,
              ),
            ];
          } else if (prevHeights.length > barCount) {
            return prevHeights.slice(0, barCount);
          } else {
            return prevHeights;
          }
        });
      }
    };

    const observer = new ResizeObserver(() => {
      generateBars();
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <Box
      p={4}
      sx={{
        height: '100%',
        width: '100%',
      }}
    >
      <Stack
        direction="row"
        ref={containerRef}
        sx={{
          height: '100%',
          justifyContent: 'center',
          alignItems: 'flex-end',
          position: 'relative',
          overflow: 'hidden',
        }}
        gap={1}
      >
        {barHeights.map((height, index) => (
          <Skeleton
            key={barHeights.length + index + height}
            variant="rectangular"
            width={20}
            height={height}
          />
        ))}
      </Stack>
    </Box>
  );
};
