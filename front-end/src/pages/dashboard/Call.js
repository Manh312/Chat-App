import { Box, Divider, IconButton, Link, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Search, SearchIconWrapper, StyledInputBase } from '../../components/Search';
import { MagnifyingGlass, Plus } from 'phosphor-react';
import Conversation from '../../components/Conversation';
import { useTheme } from '@mui/material/styles';
import { CallLogElement } from '../../components/CallElement';
import { useSelector } from 'react-redux';
import Contact from '../../components/Contact';
import StarredMessage from '../../components/StarredMessage';
import SharedMessage from '../../components/SharedMessage';
import { CallLogs } from '../../data';
import StartCall from '../../sections/main/StartCall';

const Call = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const { sidebar } = useSelector((store) => store.app);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  return (
    <>
      <Stack direction={'row'} sx={{ width: '100%' }}>
        {/* Left Side */}
        <Box sx={{
          height: '100vh',
          backgroundColor: (theme) => theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background,
          width: 320,
          boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)'
        }}>
          <Stack p={3} spacing={2} sx={{ maxHeight: '100vh' }}>
            <Stack>
              <Typography variant='h5'>Call Logs</Typography>
            </Stack>
            <Stack sx={{ width: '100%' }}>
              <Search>
                <SearchIconWrapper>
                  <MagnifyingGlass color='#709CE6' />
                </SearchIconWrapper>
                <StyledInputBase placeholder='Search...' inputProps={{ 'aria-label': 'search' }} />
              </Search>
            </Stack>
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
              <Typography variant='subtitle2' component={Link}>
                Start Conversation
              </Typography>
              <IconButton onClick={() => {
                setOpenDialog(true);
              }}>
                <Plus style={{ color: theme.palette.primary.main }} />
              </IconButton>
            </Stack>
            <Divider />
            <Stack spacing={2} direction={'column'} sx={{ flexGrow: 1, overflow: "hidden", height: "100%" }}>
              {/* <SimpleBarStyle timeout={500} style={{ height: "100%" }} clickOnTrack={false}> */}
                <Stack spacing={2.5}>
                  {/* Call Logs */}
                  {
                    CallLogs.map((element) => <CallLogElement {...element} />
                    )
                  }
                </Stack>
                {/* </SimpleBarStyle> */}
            </Stack>
            
          </Stack>
        </Box>

        {/* Right Side */}
        <Box sx={{
          height: '100%',
          width: sidebar.open ? 'calc(100vw - 740px)' : 'calc(100vw - 420px)',
          backgroundColor: theme.palette.mode === 'light' ? '#F0F4FA' : theme.palette.background.default,
        }} >
          {/* Conversation */}
          <Conversation />
        </Box>
        {/* Contact */}
        {sidebar.open && (() => {
          switch (sidebar.type) {
            case 'CONTACT':
              return <Contact />;
            case 'STARRED':
              return <StarredMessage />
            case 'SHARED':
              return <SharedMessage />;
            default:
              break;
          }
        })()}
      </Stack>
      {openDialog && <StartCall open={openDialog} handleClose={handleCloseDialog} />}
    </>
  );
}

export default Call;
