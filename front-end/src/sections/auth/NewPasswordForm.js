import React, { useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFTextField } from '../../components/hook-form';
import { Alert, Button, IconButton, InputAdornment, Stack } from '@mui/material';
import { Eye, EyeSlash } from 'phosphor-react';
import { useDispatch } from 'react-redux';
import { NewPassword } from '../../redux/slices/auth';
import { useSearchParams } from 'react-router-dom';

const NewPasswordForm = () => {
  const dispacth = useDispatch();
  const [queryParameters] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);

  const NewPasswordSchema = Yup.object().shape({
    password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters').max(16, 'Password must not exceed 16 characters'),
    passwordConfirm: Yup.string().required('Password is required').oneOf([Yup.ref('password'), null], 'Confirm Password must match with New Password'),
  });


  const methods = useForm({
    resolver: yupResolver(NewPasswordSchema),
  });

  const { reset, setError, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful }, } = methods;

  const onSubmit = async (data) => {
    try {
      dispacth(NewPassword( {...data, token: queryParameters.get('token') }));
    } catch (error) {
      console.log(error);
      reset();
      setError('afterSubmit', {
        ...error,
        message: error.message
      })
    }
  }
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && (<Alert severity='error'>{errors.afterSubmit.message}</Alert>)}
        <RHFTextField name='password' label='New Password' type={showPassword ? 'text' : 'password'} InputProps={{
          endAdornment: (
            <InputAdornment>
              <IconButton onClick={() => {
                setShowPassword(!showPassword);
              }}>
                {showPassword ? <Eye /> : <EyeSlash />}
              </IconButton>
            </InputAdornment>
          )
        }}
        />
        <RHFTextField name='passwordConfirm' label='Confirm Password' type={showPassword ? 'text' : 'password'} InputProps={{
          endAdornment: (
            <InputAdornment>
              <IconButton onClick={() => {
                setShowPassword(!showPassword);
              }}>
                {showPassword ? <Eye /> : <EyeSlash />}
              </IconButton>
            </InputAdornment>
          )
        }}
        />
        <Button
          fullWidth
          color='inherit'
          size='large'
          type='submit'
          variant='contained'
          sx={{
            bgcolor: 'text.primary',
            color: (theme) => theme.palette.mode === 'light' ? 'common.white' : 'grey.800',
            '&:hover': {
              bgcolor: 'text.primary',
              color: (theme) => theme.palette.mode === 'light' ? 'common.white' : 'grey.800',
            }
          }}>
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default NewPasswordForm;
