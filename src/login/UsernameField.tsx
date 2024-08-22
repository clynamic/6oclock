import { Person } from "@mui/icons-material";
import { InputAdornment,TextField } from "@mui/material";
import { Control, Controller,FieldErrors } from "react-hook-form";

import { LoginFormData } from "./type";

export interface UsernameFieldProps {
  control: Control<LoginFormData, unknown>;
  errors: FieldErrors<LoginFormData>;
}

export const UsernameField: React.FC<UsernameFieldProps> = ({
  control,
  errors,
}) => {
  return (
    <Controller
      name="username"
      control={control}
      defaultValue=""
      rules={{ required: "Username is required" }}
      render={({ field }) => (
        <TextField
          {...field}
          variant="outlined"
          label={field.value ? "Username" : undefined}
          placeholder="Username"
          fullWidth
          error={!!errors.username}
          helperText={errors.username?.message?.toString()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
};
