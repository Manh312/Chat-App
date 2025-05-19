import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Dialog, DialogContent, DialogTitle, Slide, Stack } from '@mui/material';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import FormProvider, { RHFTextField } from '../../components/hook-form';
import RHFAutocomplete from '../../components/hook-form/RHFAutocomplete';


const MEMBERS = ['MEM1', 'MEM2', 'MEM3'];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateGroupForm = ({handleClose}) => {
  const NewGroupSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    members: Yup.array().min(2, 'Must have at least 2 members'),
  });

  const defaultValues = {
    title: '',
    members: [],
  };

  const methods = useForm({
    resolver: yupResolver(NewGroupSchema),
    defaultValues,
  });

  const { reset, watch, setError, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful, isValid }, } = methods;

  const onSubmit = async (data) => {
    try {
      console.log('data', data);
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name='title' label='Title' />
        <RHFAutocomplete 
          name='members' 
          label='Members' 
          multiple 
          freeSolo 
          options={MEMBERS.map((option) => option)} 
          ChipProps={{size: 'medium'}}
        />
        <Stack spacing={2} direction={'row'} alignItems={'center'} justifyContent={'end'}>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button type='submit' variant='contained'>
            Create Group
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  )

}


const CreateGroup = ({ open, handleClose }) => {
  return (
    <Dialog fullWidth maxWidth='xs' open={open} TransitionComponent={Transition} keepMounted sx={{ p: 4 }}>
      <DialogTitle sx={{mb: 4}}>Create New Group</DialogTitle>
      <DialogContent>
        <CreateGroupForm handleClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
}

export default CreateGroup;
