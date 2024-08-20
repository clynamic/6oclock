import { Key } from "@mui/icons-material";
import { TextField, InputAdornment } from "@mui/material";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { LoginFormData } from "./type";
import React from "react";

export interface ApiKeyFieldProps {
  control: Control<LoginFormData, unknown>;
  errors: FieldErrors<LoginFormData>;
}

export const ApiKeyField: React.FC<ApiKeyFieldProps> = ({
  control,
  errors,
}) => {
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
