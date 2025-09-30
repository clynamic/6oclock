import { useEffect, useRef, useState } from 'react';

import { Box, Stack } from '@mui/material';

const COUNTER_IMAGES = Array.from(
  { length: 10 },
  (_, i) => `/counter/${i}.png`,
);

const useCounterImagePreloader = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const totalImages = COUNTER_IMAGES.length;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setImagesLoaded(true);
      }
    };

    COUNTER_IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded;
      img.src = src;
    });
  }, []);

  return imagesLoaded;
};

export interface CounterDisplayProps {
  number: number;
  animate?: boolean;
}

const getDigitsFromNumber = (num: number): number[] => {
  if (num === 0) return [0];

  const digits: number[] = [];
  let remaining = Math.abs(num);

  while (remaining > 0) {
    digits.unshift(remaining % 10);
    remaining = Math.floor(remaining / 10);
  }

  return digits;
};

const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

export const CounterDisplay: React.FC<CounterDisplayProps> = ({
  number,
  animate = true,
}) => {
  useCounterImagePreloader();
  const [displayNumber, setDisplayNumber] = useState(animate ? 0 : number);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!animate) {
      setDisplayNumber(number);
      return;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const duration = 200;
    const startTime = Date.now();

    let startValue: number;
    let difference: number;

    const updateCounter = () => {
      setDisplayNumber((current) => {
        if (startValue === undefined) {
          startValue = current;
          difference = number - startValue;

          if (difference === 0) return current;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutQuad(progress);

        if (progress >= 1) return number;

        const currentValue = Math.round(
          startValue + difference * easedProgress,
        );
        animationRef.current = requestAnimationFrame(updateCounter);
        return currentValue;
      });
    };

    animationRef.current = requestAnimationFrame(updateCounter);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [number, animate]);

  const digits = getDigitsFromNumber(displayNumber);

  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      {digits.map((digit, index) => (
        <Box
          key={index}
          component="img"
          src={`/counter/${digit}.png`}
          alt={`${digit}`}
          sx={{
            height: 64,
            width: 'auto',
            imageRendering: 'pixelated',
            display: 'block',
          }}
        />
      ))}
    </Stack>
  );
};
