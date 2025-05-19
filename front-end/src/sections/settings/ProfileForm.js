import React, { useCallback, useEffect } from 'react';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFTextField } from '../../components/hook-form';
import { Alert, Avatar, Button, Stack, Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar, UpdateUsers } from '../../redux/slices/app';

const ProfileForm = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const ProfileSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    about: Yup.string().required('About is required'),
    avatar: Yup.mixed()
      .nullable()
      .test('fileSize', 'File size too large (max 3MB)', (value) =>
        value instanceof File ? value.size <= 3 * 1024 * 1024 : true
      )
      .test('fileType', 'Only image files are allowed', (value) =>
        value instanceof File ? ['image/jpeg', 'image/png', 'image/gif'].includes(value.type) : true
      ),
  });

  const defaultValues = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    about: user?.about || '',
    avatar: null, // Không set avatar mặc định từ user.avatar vì nó có thể là URL
  };

  const methods = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    // Reset form khi user thay đổi
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      about: user?.about || '',
      avatar: null,
    });
  }, [user, reset]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      setValue('avatar', newFile, { shouldValidate: true });
    },
    [setValue]
  );

  const onSubmit = async (data) => {
    try {
      console.log('Form data:', data); // Debug dữ liệu form
      const response = await dispatch(
        UpdateUsers({
          firstName: data.firstName,
          lastName: data.lastName,
          about: data.about,
          avatar: data.avatar,
        })
      );

      // Không reset form để giữ dữ liệu mới trên UI
      dispatch(showSnackbar({ severity: 'success', message: response.message }));
    } catch (error) {
      console.error('Submit error:', error);
      setError('afterSubmit', {
        message: error.message || 'Failed to update profile',
      });
      dispatch(
        showSnackbar({
          severity: 'error',
          message: error.message || 'Failed to update profile',
        })
      );
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar
            sx={{ width: 56, height: 56 }}
            src={user?.avatar || '/default-avatar.png'}
            alt={user ? `${user.firstName} ${user.lastName}` : 'Guest'}
          />
          <Stack spacing={0.5}>
            <Typography variant="body2">
              {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Guest' : 'Guest'}
            </Typography>
            <Typography variant="subtitle2">{user?.email || 'No email provided'}</Typography>
          </Stack>
        </Stack>

        <Stack spacing={3}>
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Avatar
            </Typography>
            <Controller
              name="avatar"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Stack direction="column" spacing={1}>
                  {field.value?.preview && (
                    <Box
                      component="img"
                      src={field.value.preview}
                      alt="Avatar preview"
                      sx={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={(e) => handleDrop(e.target.files)}
                    style={{ marginTop: '8px' }}
                  />
                  {error && (
                    <Typography variant="caption" color="error">
                      {error.message}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Allowed *.jpeg, *.jpg, *.png, *.gif, max size of 3MB
                  </Typography>
                </Stack>
              )}
            />
          </Box>
          <RHFTextField
            name="firstName"
            label="First Name"
            helperText="This is visible to your contacts"
          />
          <RHFTextField
            name="lastName"
            label="Last Name"
            helperText="This is visible to your contacts"
          />
          <RHFTextField
            multiline
            rows={3}
            maxRows={5}
            name="about"
            label="About"
            helperText="Tell something about yourself"
          />
        </Stack>
        <Stack direction="row" justifyContent="end">
          <Button
            color="primary"
            size="large"
            type="submit"
            variant="outlined"
            disabled={isSubmitting}
          >
            Save
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

export default ProfileForm;