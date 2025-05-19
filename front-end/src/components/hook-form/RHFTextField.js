import PropTypes from "prop-types";
import { useFormContext, Controller } from 'react-hook-form';
import { TextField } from "@mui/material";

RHFTextField.prototype = {
  name: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.node,
}

export default function RHFTextField({ name, label, helperText, ...other }) {

  const { control } = useFormContext();

  return (
    <Controller 
      name={name} 
      control={control} 
      render={({ field, fieldState: { error } }) => (
      <TextField 
        {...field} 
        label={label}
        fullWidth 
        value={typeof field.value === 'number' && field.value === 0 ? '' : field.value}
        error={!!error} 
        helperText={error ? error.message : helperText} 
        {...other} />
    )}>
    </Controller>
  )
}