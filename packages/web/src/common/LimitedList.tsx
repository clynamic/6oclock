import { Box } from '@mui/material';
import { PropsWithChildren } from 'react';
import { TruncatedList, TruncatedListProps } from 'react-truncate-list';

export interface LimitedListProps extends PropsWithChildren {
  indicator: TruncatedListProps['renderTruncator'];
}

export const LimitedList: React.FC<LimitedListProps> = ({
  children,
  indicator,
}) => {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        listStyleType: 'none',
        paddingInline: 0,
        marginBlock: 0,
      }}
      renderTruncator={indicator}
      component={TruncatedList}
    >
      {children}
    </Box>
  );
};
