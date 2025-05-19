import React, { useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFTextField } from '../../components/hook-form';
import { Alert, Button, IconButton, InputAdornment, Link, Stack } from '@mui/material';
import { Eye, EyeSlash } from 'phosphor-react';
import {Link as RouterLink} from 'react-router-dom';
import { LoginUser } from '../../redux/slices/auth';
import { useDispatch } from 'react-redux';

const LoginForm = () => {

  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters').max(16, 'Password must not exceed 16 characters'),
  });


  const methods = useForm({
    resolver: yupResolver(LoginSchema),
  });

  const { reset, setError, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful }, } = methods;

  const onSubmit = async (data) => {
    try {
      dispatch(LoginUser(data));
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
        <RHFTextField name='email' label='Email address' />
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
        }}
        />
      </Stack>
      <Stack alignItems={'flex-end'} sx={{ my: 2 }}>
        <Link component={RouterLink} variant='body2' color={'inherit'} underline='always' to={'/auth/reset-password'}>
          Forgot Password?
        </Link>
      </Stack>
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
        }}>Login</Button>
    </FormProvider>
  );
}

export default LoginForm;
