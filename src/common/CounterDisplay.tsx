import { Box, Stack } from '@mui/material';
import { useEffect, useState } from 'react';

const COUNTER_IMAGES = Array.from(
  { length: 10 },
  (_, i) => `/counter/${i}.png`,
);

export const useCounterImagePreloader = () => {
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

  useEffect(() => {
    if (!animate || number === 0) {
      setDisplayNumber(number);
      return;
    }

    const duration = 200;
    const startTime = Date.now();
    const startValue = displayNumber;
    const difference = number - startValue;

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutQuad(progress);

      const currentValue = Math.round(startValue + difference * easedProgress);
      setDisplayNumber(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
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
