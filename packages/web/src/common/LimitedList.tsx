import { PropsWithChildren } from 'react';

import { BoxOwnProps, Stack } from '@mui/system';
import { TruncatedList, TruncatedListProps } from 'react-truncate-list';

export interface LimitedListProps extends PropsWithChildren {
  indicator?: TruncatedListProps['renderTruncator'];
  sx?: BoxOwnProps['sx'];
}

export const LimitedList: React.FC<LimitedListProps> = ({
  children,
  indicator,
  sx,
}) => {
  return (
    <Stack
      sx={{
        height: '100%',
        flexDirection: 'column',
        gap: 1,
        listStyleType: 'none',
        paddingInline: 0,
        marginBlock: 0,
        ...sx,
      }}
      renderTruncator={indicator ?? (() => <></>)}
      component={TruncatedList}
    >
      {children}
    </Stack>
  );
};
