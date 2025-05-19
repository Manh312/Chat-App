import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, Slide, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { ToggleSidebar, UpdateSidebarType } from '../redux/slices/app';
import { Bell, CaretRight, Phone, Prohibit, Star, Trash, VideoCamera, X } from 'phosphor-react';
import { faker } from '@faker-js/faker';
import AntSwitch from './AntSwitch';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BlockDialog = ({ open, handleClose }) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>Block this contact</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Are you sure want to block this contact?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose}>Yes</Button>
      </DialogActions>
    </Dialog>
  )
};

const DeleteDialog = ({ open, handleClose }) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>Delete this chat</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Are you sure want to delete this chat?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose}>Yes</Button>
      </DialogActions>
    </Dialog>
  )
}

const Contact = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {current_conversation} = useSelector((state) => state.conversation.direct_chat);


  const [openBlock, setOpenBlock] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const handleCloseBlock = () => {
    setOpenBlock(false);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  return (
    <Box sx={{ width: 320, height: '100vh' }}>
      <Stack sx={{ height: '100%' }}>
        {/* Header */}
        <Box sx={{
          boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)',
          width: '100%',
          backgroundColor: theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background,
        }}>
          <Stack sx={{ height: '100%', p: 2 }} direction={'row'} alignItems={'center'} justifyContent={'space-between'} spacing={3}>
            <Typography variant='subtitle2'>
              Contact Info
            </Typography>
            <IconButton onClick={() => {
              dispatch(ToggleSidebar());
            }}>
              <X />
            </IconButton>
          </Stack>
        </Box>

        {/* Body */}
        <Stack sx={{ height: '100%', position: 'relative', flexGrow: 1, overflowY: 'scroll' }} p={3} spacing={3}>
          <Stack alignItems={'center'} direction={'row'} spacing={2}>
            <Avatar 
              alt={current_conversation?.name}
              src={current_conversation?.img}  
              sx={{ height: 64, width: 64 }} />
            <Stack spacing={0.5}>
              <Typography fontWeight={600}>
                {current_conversation?.name}
              </Typography>
              <Typography fontWeight={500}>
                {'+89 768 521 20'}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-evenly'}>
            <Stack spacing={1} alignItems={'center'}>
              <IconButton>
                <Phone />
              </IconButton>
              <Typography variant='overline'>Voice</Typography>
            </Stack>
            <Stack spacing={1} alignItems={'center'}>
              <IconButton>
                <VideoCamera />
              </IconButton>
              <Typography variant='overline'>Video</Typography>
            </Stack>
          </Stack>
          <Divider />
          <Stack spacing={0.5}>
            <Typography variant='subtitle1'>About</Typography>
            <Typography variant='body2'>Imagination is the only limit</Typography>
          </Stack>
          <Divider />
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Typography variant='subtitle2'>Media, Links & Docs</Typography>
            <Button onClick={() => {
              dispatch(UpdateSidebarType('SHARED'))
            }} endIcon={<CaretRight />}>401</Button>
          </Stack>
          <Stack direction={'row'} spacing={2} alignItems={'center'}>
            {[1, 2, 3].map((element) => (
              <Box>
                <img src={faker.image.urlPlaceholder({ width: 100, height: 50 })} alt={faker.person.fullName()} />
              </Box>
            ))}
          </Stack>
          <Divider />
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Stack direction={'row'} alignItems={'center'} spacing={2}>
              <Star size={21} />
              <Typography variant='subtitle2'>Starred Messages</Typography>
            </Stack>
            <IconButton onClick={() => {
              dispatch(UpdateSidebarType('STARRED'))
            }}>
              <CaretRight />
            </IconButton>
          </Stack>
          <Divider />
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Stack direction={'row'} alignItems={'center'} spacing={2}>
              <Bell size={21} />
              <Typography variant='subtitle2'>Mute Notifications</Typography>
            </Stack>
            <AntSwitch />
          </Stack>
          <Divider />
          <Typography>1 group in common</Typography>
          <Stack direction={'row'} spacing={2}>
            <Avatar alt={faker.person.fullName()} />
            <Stack spacing={0.5}>
              <Typography variant='subtitle2'>Coding Monk</Typography>
              <Typography variant='caption'>Manh, Minh, An, You</Typography>
            </Stack>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} spacing={2}>
            <Button onClick={() => {
              setOpenBlock(true)
            }} startIcon={<Prohibit />} fullWidth variant='outlined'>Block</Button>
            <Button onClick={() => {
              setOpenDelete(true)
            }} startIcon={<Trash />} fullWidth variant='outlined'>Delete</Button>
          </Stack>
        </Stack>
      </Stack>
      {openBlock && <BlockDialog open={openBlock} handleClose={handleCloseBlock}/>}
      {openDelete && <DeleteDialog open={openDelete} handleClose={handleCloseDelete}/>}
    </Box>
  );
}

export default Contact;
