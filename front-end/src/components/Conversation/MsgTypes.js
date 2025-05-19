import { Box, Divider, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { DotsThreeVertical, DownloadSimple, Image } from 'phosphor-react';
import { Message_options } from '../../data';
import { linkify } from './Footer';




const DocMsg = ({ element, menu }) => {
  const theme = useTheme();
  return (
    <Stack direction={'row'} justifyContent={element.incoming ? 'start' : 'end'}>
      <Box
        p={1.5}
        sx={{
          backgroundColor: element.incoming
            ? theme.palette.background.default
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: 'max-content',
        }}>
        <Stack spacing={2}>
          <Stack p={2} direction={'row'} spacing={3} alignItems={'center'} sx={{ backgroundColor: theme.palette.background.paper, borderRadius: 1 }}>
            <Image size={48} />
            <Typography variant='caption'>Abstract.png</Typography>
            <IconButton>
              <DownloadSimple />
            </IconButton>
          </Stack>
          <Typography variant='body2' sx={{ color: element.incoming ? theme.palette.text : '#fff' }}>
            {element.message}
          </Typography>
        </Stack>
      </Box>
      {menu && <MessageOption />}
    </Stack>
  );
}




const LinkMsg = ({ element, menu }) => {
  const theme = useTheme();
  const formattedMessage = linkify(element.message);

  return (
    <Stack direction={'row'} justifyContent={element.incoming ? 'start' : 'end'}>
      <Box
        p={1.5}
        sx={{
          backgroundColor: element.incoming
            ? theme.palette.background.default
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: 'max-content',
        }}>
        <Stack spacing={2}>
          <Stack p={2} spacing={3} alignItems={'start'} sx={{ backgroundColor: theme.palette.background.paper, borderRadius: 1 }}>
          </Stack>
          <Typography variant='body2' color={element.incoming ? theme.palette.text : '#fff'}>
            <div dangerouslySetInnerHTML={{ __html: formattedMessage }}>
            </div>
          </Typography>
        </Stack>
      </Box>
      {menu && <MessageOption />}
    </Stack>
  );
}



const ReplyMsg = ({ element, menu }) => {
  const theme = useTheme();

  return (
    <Stack direction={'row'} justifyContent={element.incoming ? 'start' : 'end'}>
      <Box
        p={1.5}
        sx={{
          backgroundColor: element.incoming
            ? theme.palette.background.default
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: 'max-content',
        }}>
        <Stack spacing={2}>
          <Stack p={2} direction={'column'} spacing={3} alignItems={'center'} sx={{ backgroundColor: theme.palette.background.paper, borderRadius: 1 }}>
            <Typography variant='body2' color={theme.palette.text}>
              {element.message}
            </Typography>
          </Stack>
          <Typography variant='body2' color={element.incoming ? theme.palette.text : '#fff'}>
            {element.reply}
          </Typography>
        </Stack>
      </Box>
      {menu && <MessageOption />}
    </Stack>
  );
}



const MediaMsg = ({ element, menu }) => {
  const theme = useTheme();
  return (
    <Stack direction={'row'} justifyContent={element.incoming ? 'start' : 'end'}>
      <Box
        p={1.5}
        sx={{
          backgroundColor: element.incoming
            ? theme.palette.background.default
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: 'max-content',
        }}>
        <Stack spacing={1}>
          <img src={element.img} alt={element.message} style={{ maxHeight: 210, width: '100%', borderRadius: '10px' }} />
          <Typography variant='body2' color={element.incoming ? theme.palette.text : '#fff'}>
            {element.message}
          </Typography>
        </Stack>
      </Box>
      {menu && <MessageOption />}
    </Stack>
  )
}


const TextMsg = ({ element, menu }) => {
  const theme = useTheme();
  return (
    <Stack direction={'row'} justifyContent={element.incoming ? 'start' : 'end'}>
      <Box
        p={1.5}
        sx={{
          backgroundColor: element.incoming
            ? theme.palette.background.default
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: 'max-content',
        }}>
        <Typography variant='body2' color={element.incoming ? theme.palette.text : '#fff'}>
          {element.message}
        </Typography>
      </Box>
      {menu && <MessageOption />}
    </Stack>
  );
};



const TimeLine = ({ element }) => {
  const theme = useTheme();
  return (
    <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
      <Divider width={'46%'} />
      <Typography variant='caption' sx={{ color: theme.palette.text }}>
        {element.text}
      </Typography>
      <Divider width={'46%'} />
    </Stack>
  );
};

const MessageOption = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <DotsThreeVertical id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick} size={20} />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <Stack spacing={1} px={1}>
          {Message_options.map((option) => (
            <MenuItem onClick={handleClick}>{option.title}</MenuItem>
          ))}
        </Stack>
      </Menu>
    </>
  )
}

export { TimeLine, TextMsg, MediaMsg, ReplyMsg, LinkMsg, DocMsg };
