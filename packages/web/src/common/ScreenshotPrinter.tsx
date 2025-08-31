import React, { useEffect, useRef } from 'react';

import { Box, useTheme } from '@mui/material';
import { format } from 'date-fns';

import { AXIOS_INSTANCE } from '../http/axios';

interface ScreenshotPrinterProps {
  children: (printHandler: () => void) => React.ReactNode;
  /**
   * Optional filename for the downloaded screenshot.
   */
  filename?: string;
  /**
   * Optional ID of the target element to take a screenshot of.
   */
  targetId?: string;
}

export const ScreenshotPrinter: React.FC<ScreenshotPrinterProps> = ({
  children,
  filename = 'screenshot',
  targetId,
}) => {
  const theme = useTheme();
  const screenshotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!screenshotRef.current) return;

    // This cannot be done in the onclone function for inexplicable reasons.
    const processImages = () => {
      const images =
        screenshotRef.current!.querySelectorAll<HTMLImageElement>('img');
      images.forEach((image) => {
        if (image.src.includes('https://static1.e621.net')) {
          const newSrc = image.src.replace(
            'https://static1.e621.net',
            `${AXIOS_INSTANCE.defaults.baseURL!}/proxy`,
          );
          image.setAttribute('src', newSrc);
        }
      });
    };

    processImages();

    const observer = new MutationObserver(() => {
      processImages();
    });

    observer.observe(screenshotRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handlePrint = async () => {
    const targetElement = targetId
      ? document.getElementById(targetId)
      : screenshotRef.current;

    if (targetElement) {
      // Dynamically import html2canvas to avoid including it in the main bundle
      const { default: html2canvas } = await import('@wtto00/html2canvas');

      html2canvas(targetElement, {
        useCORS: true,
        backgroundColor: theme.palette.background.paper,
        onclone: (clonedDocument: Document) => {
          clonedDocument
            .querySelectorAll<HTMLElement>('.MuiTypography-root')
            .forEach((el) => {
              const bg = window.getComputedStyle(el).backgroundImage;
              if (bg.includes('linear-gradient')) {
                el.style.color =
                  bg
                    .match(
                      /#[0-9a-fA-F]+|rgba?\([\d\s,]+\)|hsla?\([\d\s%,]+\)/,
                    )?.[0]
                    ?.trim() || 'currentColor';
                el.style.backgroundImage = 'none';
              }
            });

          clonedDocument
            .querySelectorAll<HTMLElement>('.MuiCard-root')
            .forEach((card) => {
              Object.assign(card.style, {
                backgroundColor: '#213a5f',
                backgroundImage: 'unset',
                boxShadow: 'none',
              });
            });

          const clonedTarget = targetId
            ? clonedDocument.getElementById(targetId)
            : clonedDocument.body;

          if (clonedTarget) {
            Object.assign(clonedTarget.style, {
              backgroundColor: theme.palette.background.paper,
              backgroundImage: `url("/assets/hex-texture.png")`,
              backgroundRepeat: 'repeat-x',
              backgroundPosition: 'top left',
            });
          }
        },
      }).then((canvas: HTMLCanvasElement) => {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.png`;
        a.click();
      });
    }
  };

  return (
    <Box ref={screenshotRef} sx={{ display: 'contents' }}>
      {children(handlePrint)}
    </Box>
  );
};
