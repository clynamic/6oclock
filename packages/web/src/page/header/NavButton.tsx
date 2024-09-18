import {
  Button,
  ButtonBaseProps,
  ButtonProps,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuItemProps,
  Typography,
} from '@mui/material';

import { usePageHeaderContext } from './PageHeaderContext';

export type NavButtonProps = ButtonBaseProps & MenuItemProps & ButtonProps;

export const NavButton: React.FC<NavButtonProps> = (props) => {
  const { layout, popupState } = usePageHeaderContext();

  if (layout === 'small') {
    const { endIcon, color, children, ...menuProps } = props;

    return (
      <MenuItem
        {...menuProps}
        sx={{
          ...(props.sx || {}),
          color: (theme) =>
            color === 'primary' ? theme.palette.primary.main : undefined,
        }}
        onClick={(e) => {
          props.onClick?.(e);
          if (!e.defaultPrevented) {
            popupState?.close();
          }
        }}
      >
        {endIcon ? (
          <ListItemIcon
            sx={{
              color: (theme) =>
                color === 'primary' ? theme.palette.primary.main : undefined,
            }}
          >
            {endIcon}
          </ListItemIcon>
        ) : null}
        <ListItemText>{children}</ListItemText>
      </MenuItem>
    );
  }
  if (layout === 'wide') {
    return (
      <Button
        variant="text"
        size="small"
        color="secondary"
        sx={{
          ...(props.sx || {}),
          textTransform: 'none',
          p: 0.2,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
        {...props}
      >
        <Typography>{props.children}</Typography>
      </Button>
    );
  }

  return null;
};
