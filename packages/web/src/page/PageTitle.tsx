import { useEffect } from 'react';

export interface WindowTitleProps {
  title?: string;
  subtitle?: string;
}

export const PageTitle: React.FC<WindowTitleProps> = ({ title, subtitle }) => {
  useEffect(() => {
    document.title = title
      ? `${title}`
      : subtitle
        ? `${subtitle} - 6 o'clock`
        : "6 o'clock";
  }, [subtitle, title]);

  return null;
};
