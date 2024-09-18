import { useEffect } from 'react';

export interface WindowTitleProps {
  title?: string;
  subtitle?: string;
}

export const PageTitle: React.FC<WindowTitleProps> = ({ title, subtitle }) => {
  useEffect(() => {
    document.title = title ? `${title}` : `6 o'clock - ${subtitle}`;
  }, [subtitle, title]);

  return null;
};
