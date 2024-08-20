import { useEffect } from "react";

export const WindowTitle = ({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) => {
  useEffect(() => {
    document.title = title ? `${title}` : `6 o'clock - ${subtitle}`;
  }, [subtitle, title]);

  return null;
};
