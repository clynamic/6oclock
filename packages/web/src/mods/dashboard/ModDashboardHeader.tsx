import { Cancel, Edit, Save } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useState } from "react";

import { useDashboard } from "../../dashboard";
import { PageHeader, PageHeaderSpacer } from "../../page";

export const ModDashboardHeader = () => {
  const { config, setConfig, saveConfig, isEditing, setIsEditing, isLoading } =
    useDashboard();

  const [previousConfig, setPreviousConfig] = useState(config);

  return (
    <PageHeader
      actions={
        !isLoading
          ? [
              PageHeaderSpacer,
              ...(isEditing
                ? [
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
                  ]
                : [
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
                  ]),
            ]
          : undefined
      }
    />
  );
};
