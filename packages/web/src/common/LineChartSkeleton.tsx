import React, { useEffect, useRef, useState } from 'react';

import { Box, Skeleton, Stack } from '@mui/material';

interface Point {
  x: number;
  y: number;
}

export const LineChartSkeleton: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Point[]>([]);

  const pointGap = 20;

  useEffect(() => {
    const ref = containerRef;

    const generatePoints = () => {
      if (ref.current) {
        const containerWidth = ref.current.offsetWidth;
        const containerHeight = ref.current.offsetHeight;
        const pointCount = Math.floor(containerWidth / pointGap);

        setPoints(() =>
          Array.from({ length: pointCount }, (_, index) => ({
            x: index * pointGap,
            y: 10 + Math.random() * (containerHeight - 20),
          })),
        );
      }
    };

    const observer = new ResizeObserver(() => {
      generatePoints();
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
        position: 'relative',
      }}
    >
      <Stack
        direction="row"
        ref={containerRef}
        sx={{
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Skeleton
          variant="rectangular"
          component="svg"
          width="100%"
          height="100%"
          sx={{
            bgcolor: 'transparent',
            position: 'absolute',
            pointerEvents: 'none',
          }}
        >
          <Skeleton
            variant="rectangular"
            component="polyline"
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="grey"
            strokeWidth={2}
            sx={{ visibility: 'visible' }}
          />
        </Skeleton>
        {points.map((point, index) => (
          <Skeleton
            key={index}
            variant="circular"
            width={10}
            height={10}
            sx={{
              position: 'absolute',
              left: `${point.x}px`,
              top: `${point.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};
