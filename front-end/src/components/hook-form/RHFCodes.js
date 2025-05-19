import { Stack, TextField } from '@mui/material';
import React, { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export default function RHFCodes ({ keyName = '', inputs = [], ...other }) {
  const codesRef = useRef(null);

  const { control } = useFormContext();

  const handleChangeWithNextField = (event, handleChange) => {
    const {maxLength, value, name} = event.target;

    const fieldIndex = name.replace(keyName, '');

    const fieldInIndex = Number(fieldIndex);

    // if (event.inputType === 'insertFromPaste' && value.length === 6) {
    //   const fields = document.querySelectorAll(`input[name^=${keyName}]`);
    //   value.split('').forEach((char, index) => {
    //     if (fields[index]) {
    //       fields[index].value = char;
    //       fields[index].focus();
    //     }
    //   });
    //   return;
    // };

    if (event.key === 'Backspace' && value.length === 0 && fieldInIndex > 1) {
      const prevField = document.querySelector(`input[name=${keyName}${fieldInIndex - 1}]`);
      if (prevField) {
        prevField.focus();
        prevField.value = ''
      };
      return;
    };

    const nextField = document.querySelector(`input[name=${keyName}${fieldInIndex + 1}]`);

    if (value.length > maxLength) {
      event.target.value = value[0];
    }

    if (value.length >= maxLength && fieldInIndex < 6 && nextField !== null) {
      nextField.focus();
    }

    handleChange(event);
  };


  return (
    <Stack direction={'row'} spacing={2} justifyContent={'center'} ref={codesRef}>
      {inputs.map((name, index) => (
        <Controller
          key={name}
          name={`${keyName}${index + 1}`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField 
              {...field} 
              error={!!error} 
              autoFocus={index === 0} 
              placeholder={'-'} 
              onChange={(event) => {
                handleChangeWithNextField(event, field.onChange);
              }}
              onKeyDown={(event) => {
                handleChangeWithNextField(event, field.onChange);
              }}
              // onPaste={(event) => {
              //   const pasteValue = event.clipboardData.getData('text');
              //   if (pasteValue.length === 6) {
              //     handleChangeWithNextField({
              //       target: { value: pasteValue, name: field.name },
              //       inputType: 'insertFromPaste'
              //     }, field.onChange);
              //     event.preventDefault();
              //   }
              // }}
              onFocus={(event) => event.currentTarget.select()}
              InputProps={{
                sx: {
                  width: {xs: 36, sm: 56},
                  height: {xs: 36, sm: 56},
                  '& input': {p: 0, textAlign: 'center'}
                },
              }}
              inputProps={{
                maxLength: 1,
                type: 'number',
              }}
              {...other}
            />
          )}>

        </Controller>
      ))}
    </Stack>
  );
};