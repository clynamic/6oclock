import { Key } from "@mui/icons-material";
import { TextField, InputAdornment } from "@mui/material";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { LoginFormData } from "./type";

export interface ApiKeyFieldProps {
  control: Control<LoginFormData, any>;
  errors: FieldErrors<LoginFormData>;
}

export const ApiKeyField = ({ control, errors }: ApiKeyFieldProps) => {
  return (
    <Controller
      name="password"
      control={control}
      defaultValue=""
      rules={{ required: "API Key is required" }}
      render={({ field }) => (
        <TextField
          {...field}
          type="password"
          variant="outlined"
          label={field.value ? "API Key" : undefined}
          placeholder="API Key"
          fullWidth
          error={!!errors.password}
          helperText={errors.password?.message?.toString()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Key />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
};
