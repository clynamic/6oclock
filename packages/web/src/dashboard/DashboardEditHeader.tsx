import { useMemo, useState } from 'react';

import { Cancel, Category, Edit, Save } from '@mui/icons-material';
import { Checkbox, Menu, MenuItem } from '@mui/material';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';

import { DashboardPosition, DashboardPositions } from '../api';
import { NavButton } from '../page/header/NavButton';
import { NavDivider } from '../page/header/NavDivider';
import { NavSpacer } from '../page/header/NavSpacer';
import { useDashboard } from './DashboardContext';

export const DashboardEditHeader: React.FC = () => {
  const {
    config,
    currentLayout,
    catalog,
    setConfig,
    saveConfig,
    isEditing,
    setIsEditing,
    isLoading,
  } = useDashboard();

  const [previousConfig, setPreviousConfig] = useState(config);

  const currentItems = useMemo(() => {
    return currentLayout?.map((item) => item.i);
  }, [currentLayout]);

  if (!isLoading) {
    if (isEditing) {
      return (
        <>
          <NavSpacer key="edit-dashboard-spacer" />
          <PopupState
            variant="popover"
            popupId="dashboard-items-menu"
            key="edit-dashboard-items-menu"
          >
            {(popupState) => (
              <>
                <NavButton
                  {...bindTrigger(popupState)}
                  onClick={(e) => {
                    e.preventDefault();
                    popupState.open(e);
                  }}
                  endIcon={<Category />}
                >
                  Items
                </NavButton>
                <Menu
                  {...bindMenu(popupState)}
                  slotProps={{
                    paper: {
                      sx: {
                        minWidth: popupState.anchorEl?.clientWidth,
                      },
                    },
                  }}
                >
                  {Object.entries(catalog).map(([key, value]) => {
                    return (
                      <MenuItem
                        key={key}
                        onClick={() => {
                          if (currentItems?.includes(key)) {
                            setConfig({
                              ...config!,
                              positions: Object.entries(
                                config!.positions,
                              ).reduce(
                                (
                                  acc,
                                  [breakpoint, items]: [
                                    string,
                                    DashboardPosition[],
                                  ],
                                ) => {
                                  return {
                                    ...acc,
                                    [breakpoint]: items.filter(
                                      (item) => item.i !== key,
                                    ),
                                  };
                                },
                                {} as DashboardPositions,
                              ),
                            });
                          } else {
                            setConfig({
                              ...config!,
                              positions: Object.entries(
                                config!.positions,
                              ).reduce(
                                (
                                  acc,
                                  [breakpoint, items]: [
                                    string,
                                    DashboardPosition[],
                                  ],
                                ) => {
                                  return {
                                    ...acc,
                                    [breakpoint]: [
                                      ...items,
                                      {
                                        i: key,
                                        ...catalog[key].layout[breakpoint!],
                                      },
                                    ],
                                  };
                                },
                                {} as DashboardPositions,
                              ),
                            });
                          }
                        }}
                      >
                        <Checkbox checked={currentItems?.includes(key)} />
                        {value.name}
                      </MenuItem>
                    );
                  })}
                </Menu>
              </>
            )}
          </PopupState>
          <NavDivider key="edit-dashboard-divider" />
          <NavButton
            key="cancel-edit"
            endIcon={<Cancel />}
            onClick={() => {
              if (previousConfig) {
                setConfig(previousConfig);
                setPreviousConfig(undefined);
              }
              setIsEditing(false);
            }}
          >
            Cancel
          </NavButton>
          <NavButton
            key="save-edit"
            color="primary"
            endIcon={<Save />}
            onClick={() => {
              saveConfig(config!);
              setPreviousConfig(undefined);
              setIsEditing(false);
            }}
          >
            Save
          </NavButton>
        </>
      );
    } else {
      return (
        <>
          <NavSpacer key="edit-dashboard-spacer" />
          <NavButton
            key="edit-dashboard"
            endIcon={<Edit />}
            onClick={() => {
              setPreviousConfig(config);
              setIsEditing(true);
            }}
          >
            Edit
          </NavButton>
        </>
      );
    }
  }

  return null;
};
