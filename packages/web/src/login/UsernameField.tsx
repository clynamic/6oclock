import { Person } from "@mui/icons-material";
import { TextField, InputAdornment } from "@mui/material";
import { Control, FieldErrors, Controller } from "react-hook-form";
import { LoginFormData } from "./type";

export interface UsernameFieldProps {
  control: Control<LoginFormData, any>;
  errors: FieldErrors<LoginFormData>;
}

export const UsernameField = ({ control, errors }: UsernameFieldProps) => {
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
