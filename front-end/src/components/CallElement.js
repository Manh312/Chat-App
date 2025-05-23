import { faker } from '@faker-js/faker';
import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import StyledBadge from './StyledBadge';
import { ArrowDownLeft, ArrowUpRight, Phone, VideoCamera } from 'phosphor-react';

const CallLogElement = ({ online, incoming, missed }) => {
  return (
    <>
      <Box sx={{
        width: '100%',
        borderRadius: 1,
        backgroundColor: (theme) => theme.palette.mode === 'light' ? '#fff' : theme.palette.background.paper,
      }}
        p={2}
      >
        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
          <Stack spacing={2} direction={'row'} alignItems={'center'}>
            {online ? (
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot">
                <Avatar/>
              </StyledBadge>
            ) : (<Avatar alt={faker.person.fullName()} />
            )}

            <Stack spacing={0.3}>
              <Typography variant='subtitle2'>{faker.person.fullName()}</Typography>
              <Stack direction={'row'} alignItems={'center'} spacing={1}>
                {incoming ? (
                  <ArrowDownLeft color={missed ? 'red' : 'green'} />
                ) : (
                  <ArrowUpRight color={missed ? 'red' : 'green'} />
                )}
                <Typography variant='caption'>Yesterday 21:20</Typography>
              </Stack>
            </Stack>
          </Stack>
          <IconButton>
            <Phone color='green' />
          </IconButton>
        </Stack>

      </Box>
    </>
  );
};

const CallElement = ({ online }) => {
  return (
    <Box sx={{
      width: '100%',
      borderRadius: 1,
      backgroundColor: (theme) => theme.palette.mode === 'light' ? '#fff' : theme.palette.background.paper,
    }}
      p={2}
    >
      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
        <Stack spacing={2} direction={'row'} alignItems={'center'}>
          {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot">
              <Avatar />
            </StyledBadge>
          ) : (<Avatar alt={faker.person.fullName()} />
          )}
          <Stack spacing={0.3}>
            <Typography variant='subtitle2'>{faker.person.fullName()}</Typography>
          </Stack>
        </Stack>
        <Stack direction={'row'} alignItems={'center'}>
          <IconButton>
            <Phone color='green' />
          </IconButton>
          <IconButton>
            <VideoCamera color='green' />
          </IconButton>
        </Stack>
      </Stack>

    </Box>
  )
}

export { CallElement, CallLogElement };
