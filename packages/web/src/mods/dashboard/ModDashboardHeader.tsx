import { Cancel, Edit, Save } from "@mui/icons-material";
import { Box, Button, Checkbox, Menu, MenuItem } from "@mui/material";
import { MouseEvent, useMemo, useState } from "react";

import { DashboardPosition, DashboardPositions } from "../../api";
import { useDashboard } from "../../dashboard";
import { PageHeader, PageHeaderDivider, PageHeaderSpacer } from "../../page";

export const ModDashboardHeader = () => {
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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const currentItems = useMemo(() => {
    return currentLayout?.map((item) => item.i);
  }, [currentLayout]);

  const actions = useMemo(() => {
    if (!isLoading) {
      if (isEditing) {
        return [
          PageHeaderSpacer,
          {
            label: (
              <Box key="menu">
                <Button
                  variant="text"
                  size="small"
                  color="secondary"
                  id="basic-button"
                  aria-controls={open ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                >
                  Items
                </Button>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
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
                                config!.positions
                              ).reduce(
                                (
                                  acc,
                                  [breakpoint, items]: [
                                    string,
                                    DashboardPosition[],
                                  ]
                                ) => {
                                  return {
                                    ...acc,
                                    [breakpoint]: items.filter(
                                      (item) => item.i !== key
                                    ),
                                  };
                                },
                                {} as DashboardPositions
                              ),
                            });
                          } else {
                            setConfig({
                              ...config!,
                              positions: Object.entries(
                                config!.positions
                              ).reduce(
                                (
                                  acc,
                                  [breakpoint, items]: [
                                    string,
                                    DashboardPosition[],
                                  ]
                                ) => {
                                  return {
                                    ...acc,
                                    [breakpoint]: [
                                      ...items,
                                      {
                                        i: key,
                                        ...catalog[key].defaultLayout[
                                          breakpoint!
                                        ],
                                      },
                                    ],
                                  };
                                },
                                {} as DashboardPositions
                              ),
                            });
                          }
                        }}
                      >
                        <Checkbox checked={currentItems?.includes(key)} />
                        {value.card?.title}
                      </MenuItem>
                    );
                  })}
                </Menu>
              </Box>
            ),
          },
          PageHeaderDivider,
          {
            label: (
              <Button
                variant="text"
                size="small"
                color="secondary"
                key="cancel"
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
              </Button>
            ),
          },
          {
            label: (
              <Button
                variant="text"
                size="small"
                color="primary"
                key="save"
                endIcon={<Save />}
                onClick={() => {
                  saveConfig(config!);
                  setPreviousConfig(undefined);
                  setIsEditing(false);
                }}
              >
                Save
              </Button>
            ),
          },
        ];
      } else {
        return [
          PageHeaderSpacer,
          {
            label: (
              <Button
                variant="text"
                size="small"
                color="secondary"
                key="edit"
                endIcon={<Edit />}
                onClick={() => {
                  setPreviousConfig(config);
                  setIsEditing(true);
                }}
              >
                Edit
              </Button>
            ),
          },
        ];
      }
    }
    return [];
  }, [
    isLoading,
    isEditing,
    open,
    anchorEl,
    catalog,
    currentItems,
    setConfig,
    config,
    previousConfig,
    setIsEditing,
    saveConfig,
  ]);

  return <PageHeader actions={actions} />;
};
