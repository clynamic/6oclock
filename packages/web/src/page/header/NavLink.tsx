import {
  Button,
  ButtonProps,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuItemProps,
  Typography,
} from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { usePageHeaderContext } from './PageHeaderContext';

export type NavLinkProps = {
  href: string;
  label: React.ReactNode;
  endIcon?: React.ReactNode;
  hidden?: boolean;
} & ButtonProps &
  MenuItemProps;

export const NavLink: React.FC<NavLinkProps> = ({
  href,
  label,
  endIcon,
  hidden,
  ...props
}) => {
  const { layout, popupState, navigate } = usePageHeaderContext();

  if (hidden) return null;

  if (layout === 'small') {
    return (
      <MenuItem
        {...props}
        sx={{
          ...(props.sx || {}),
          color: (theme) =>
            props.color === 'primary' ? theme.palette.primary.main : undefined,
        }}
        onClick={(e) => {
          props.onClick?.(e);
          if (!e.defaultPrevented) {
            navigate(href);
            popupState?.close();
          }
        }}
      >
        {endIcon ? (
          <ListItemIcon
            sx={{
              color: (theme) =>
                props.color === 'primary'
                  ? theme.palette.primary.main
                  : undefined,
            }}
          >
            {endIcon}
          </ListItemIcon>
        ) : null}
        <ListItemText>{label}</ListItemText>
      </MenuItem>
    );
  }

  if (layout === 'wide') {
    return (
      <Button
        component={RouterLink}
        to={href}
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
        <Typography>{label}</Typography>
      </Button>
    );
  }

  return null;
};
