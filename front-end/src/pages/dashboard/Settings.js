import { Avatar, Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Bell, CaretLeft, Image, Info, Key, Keyboard, Lock, Note, PencilCircle } from 'phosphor-react';
import { faker } from '@faker-js/faker';
import Shortcuts from '../../sections/settings/Shortcuts';
import { useSelector } from 'react-redux';

const Settings = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [openShortcuts, setOpenShortcuts] = useState(false);

  const handleOpenShortcuts = () => {
    setOpenShortcuts(true);
  };

  const handleCloseShortcuts = () => {
    setOpenShortcuts(false);
  };

  const list = [
    {
      key: 0,
      icon: <Bell size={20} />,
      title: 'Notifications',
      onclick: () => {},
    },
    {
      key: 1,
      icon: <Lock size={20} />,
      title: 'Privacy',
      onclick: () => {},
    },
    {
      key: 2,
      icon: <Key size={20} />,
      title: 'Security',
      onclick: () => {},
    },
    {
      key: 3,
      icon: <PencilCircle size={20} />,
      title: 'Theme',
      onclick: () => {},
    },
    {
      key: 4,
      icon: <Image size={20} />,
      title: 'Chat Wallpaper',
      onclick: () => {},
    },
    {
      key: 5,
      icon: <Note size={20} />,
      title: 'Request Account Info',
      onclick: () => {},
    },
    {
      key: 6,
      icon: <Keyboard size={20} />,
      title: 'Keyboard Shortcut',
      onclick: handleOpenShortcuts,
    },
    {
      key: 7,
      icon: <Info size={20} />,
      title: 'Help',
      onclick: () => {},
    },
  ];

  return (
    <>
      <Stack direction={'row'} sx={{ width: '100%' }}>
        <Box
          sx={{
            overflowY: 'scroll',
            height: '100%',
            width: 320,
            backgroundColor: theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background,
            boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Stack p={4} spacing={5}>
            <Stack direction={'row'} alignItems={'center'} spacing={3}>
              <IconButton>
                <CaretLeft size={24} color="#4B4B4B" />
              </IconButton>
              <Typography variant="h4">Settings</Typography>
            </Stack>
            <Stack direction={'row'} spacing={3}>
              <Avatar
                sx={{ width: 56, height: 56 }}
                src={user?.avatar}
                alt={user ? `${user.firstName} ${user.lastName}` : 'Guest'}
              />
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
                </Typography>
                <Typography variant="subtitle2">{user?.email || ''}</Typography>
              </Stack>
            </Stack>
            <Stack spacing={4}>
              {list.map(({ key, icon, title, onclick }) => (
                <React.Fragment key={key}>
                  <Stack sx={{ cursor: 'pointer' }} onClick={onclick}>
                    <Stack direction={'row'} alignItems={'center'} spacing={3}>
                      {icon}
                      <Typography variant="body2">{title}</Typography>
                    </Stack>
                    {key !== 7 && <Divider />}
                  </Stack>
                </React.Fragment>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Stack>
      {openShortcuts && <Shortcuts open={openShortcuts} handleClose={handleCloseShortcuts} />}
    </>
  );
};

export default Settings;