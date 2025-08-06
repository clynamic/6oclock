import React from 'react';

import {
  Button,
  ButtonProps,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuItemProps,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { usePageHeaderContext } from './PageHeaderContext';

export type NavLinkVariant = 'top' | 'sub';

export type NavLinkProps = {
  href: string;
  label: React.ReactNode;
  endIcon?: React.ReactNode;
  hidden?: boolean;
  selected?: boolean;
  variant?: NavLinkVariant;
} & Omit<ButtonProps & MenuItemProps, 'href' | 'variant'>;

export const NavItem: React.FC<NavLinkProps> = ({
  href,
  label,
  endIcon,
  hidden,
  selected,
  variant,
  ...props
}) => {
  const { layout, popupState, navigate, section } = usePageHeaderContext();

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
        selected={selected}
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
        endIcon={endIcon}
        sx={{
          ...(props.sx || {}),
          textTransform: 'none',
          p: (variant ?? section) === 'sub' ? 0.2 : undefined,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          backgroundColor: selected ? 'background.paper' : undefined,
        }}
        {...props}
      >
        <Typography>{label}</Typography>
      </Button>
    );
  }

  return null;
};
