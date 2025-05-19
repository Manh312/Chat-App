import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import FormProvider, { RHFTextField } from '../../components/hook-form';
import { Alert, Button, IconButton, InputAdornment, Stack } from '@mui/material';
import { Eye, EyeSlash } from 'phosphor-react';
import { RegisterUser } from '../../redux/slices/auth';
import { useDispatch } from 'react-redux';


const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters').max(16, 'Password must not exceed 16 characters'),
  });


  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
  });

  const { reset, setError, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful }, } = methods;

  const onSubmit = async (data) => {
    try {
      dispatch(RegisterUser(data));
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
        {!!errors.afterSubmit && (
          <Alert severity='error'>{errors.afterSubmit.message}</Alert>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField name='firstName' label='First Name' />
          <RHFTextField name='lastName' label='Last Name' />
        </Stack>
        <RHFTextField name='email' label='Email' />
        <RHFTextField name='password' label='Password' type={showPassword ? 'text' : 'password'} InputProps={{
          endAdornment: (
            <InputAdornment>
              <IconButton onClick={() => {
                setShowPassword(!showPassword);
              }}>
                {showPassword ? <Eye /> : <EyeSlash />}
              </IconButton>
            </InputAdornment>
          )
        }} />
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
          Create Account
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default RegisterForm;
