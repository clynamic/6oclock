import React from 'react';

import { useMotd } from '../api';

export const HomeMotd: React.FC = () => {
  const { data: motd } = useMotd();

  const defaultMessage = 'Your valiant efforts are appreciated.';
  const message = motd?.message ?? defaultMessage;

  return <span dangerouslySetInnerHTML={{ __html: message }} />;
};
