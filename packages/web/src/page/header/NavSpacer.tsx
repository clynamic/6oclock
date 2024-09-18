import { Box, Divider } from '@mui/material';

import { usePageHeaderContext } from './PageHeaderContext';

export const NavSpacer: React.FC = () => {
  const { layout } = usePageHeaderContext();

  if (layout === 'small') {
    return <Divider orientation="horizontal" variant="middle" />;
  }
  if (layout === 'wide') {
    return <Box sx={{ flexGrow: 1 }} />;
  }
};
