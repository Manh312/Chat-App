import React, { useRef, useState } from 'react';
import { Box, Fab, IconButton, InputAdornment, Stack, TextField, Tooltip } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { Camera, File, Image, LinkSimple, PaperPlaneTilt, Smiley, Sticker, User } from 'phosphor-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../../socket';
import { AddDirectMessage } from '../../redux/slices/conversation';

const StyledInput = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    paddingTop: '12px',
    paddingBottom: '12px',
  },
}));

const Actions = [
  {
    color: '#4da5fe',
    icon: <Image size={24} />,
    y: 102,
    title: 'Photo/Video',
  },
  {
    color: '#1b8cfe',
    icon: <Sticker size={24} />,
    y: 172,
    title: 'Stickers',
  },
  {
    color: '#0172e4',
    icon: <Camera size={24} />,
    y: 242,
    title: 'Image',
  },
  {
    color: '#0159b2',
    icon: <File size={24} />,
    y: 312,
    title: 'Document',
  },
  {
    color: '#013f7f',
    icon: <User size={24} />,
    y: 382,
    title: 'Contact',
  },
];

const ChatInput = ({ openPicker, setOpenPicker, setValue, value, inputRef }) => {
  const [openActions, setOpenActions] = useState(false);
  return (
    <StyledInput
      fullWidth
      placeholder="Write a message"
      variant="filled"
      value={value}
      inputRef={inputRef}
      onChange={(event) => {
        setValue(event.target.value);
      }}
      InputProps={{
        disableUnderline: true,
        startAdornment: (
          <Stack sx={{ width: 'max-content' }}>
            <Stack sx={{ position: 'relative', display: openActions ? 'inline-block' : 'none' }}>
              {Actions.map((element) => (
                <Tooltip placement="right" title={element.title} key={element.title}>
                  <Fab sx={{ position: 'absolute', top: -element.y, backgroundColor: element.color }}>
                    {element.icon}
                  </Fab>
                </Tooltip>
              ))}
            </Stack>
            <InputAdornment>
              <IconButton
                onClick={() => {
                  setOpenActions(!openActions);
                }}
              >
                <LinkSimple />
              </IconButton>
            </InputAdornment>
          </Stack>
        ),
        endAdornment: (
          <InputAdornment>
            <IconButton
              onClick={() => {
                setOpenPicker(!openPicker);
              }}
            >
              <Smiley />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank" style="color: #0172e4; text-decoration: underline;">${url}</a>`
  );
}

function containsUrl(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
}

const Footer = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [openPicker, setOpenPicker] = useState(false);
  const { current_conversation } = useSelector((state) => state.conversation.direct_chat);
  const { room_id } = useSelector((state) => state.app);

  const user_id = window.localStorage.getItem('user_id');
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  function handleEmojiClick(emoji) {
    const input = inputRef.current;
    if (input) {
      const selectionStart = input.selectionStart;
      const selectionEnd = input.selectionEnd;
      setValue(value.substring(0, selectionStart) + emoji + value.substring(selectionEnd));
      input.selectionStart = input.selectionEnd = selectionStart + 1;
    }
  }

  const handleSendMessage = () => {
    if (!value.trim() || !room_id || !current_conversation?.user_id) {
      console.error('Cannot send message: ', { value, room_id, user_id: current_conversation?.user_id });
      return;
    }

    // Tạo tin nhắn tạm thời với cấu trúc giống trong fetchCurrentMessages
    const tempMessage = {
      id: `temp_${Date.now()}`, // Sử dụng "id" thay vì "_id"
      type: 'msg',
      subtype: containsUrl(value) ? 'Link' : 'Text',
      message: value,
      incoming: false, // Tin nhắn gửi đi
      outgoing: true, // Tin nhắn gửi đi
    };

    // Dispatch tin nhắn tạm thời vào Redux
    console.log('Adding temporary message:', tempMessage);
    dispatch(AddDirectMessage(tempMessage)); // Truyền trực tiếp tempMessage

    // Gửi tin nhắn qua Socket.IO
    console.log('Emitting text_message:', {
      message: value,
      conversation_id: room_id,
      from: user_id,
      to: current_conversation.user_id,
      type: containsUrl(value) ? 'Link' : 'Text',
    });
    socket.emit('text_message', {
      message: value,
      conversation_id: room_id,
      from: user_id,
      to: current_conversation.user_id,
      type: containsUrl(value) ? 'Link' : 'Text',
    });

    // Xóa input
    setValue('');
  };

  return (
    <Box
      p={2}
      sx={{
        height: 100,
        width: '100%',
        backgroundColor: theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background.default,
        boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={3}>
        <Stack sx={{ width: '100%' }}>
          <Box
            sx={{
              display: openPicker ? 'inline' : 'none',
              zIndex: 10,
              position: 'fixed',
              bottom: 81,
              right: 100,
            }}
          >
            <Picker
              theme={theme.palette.mode}
              data={data}
              onEmojiSelect={(emoji) => {
                handleEmojiClick(emoji.native);
              }}
            />
          </Box>
          <ChatInput
            setOpenPicker={setOpenPicker}
            openPicker={openPicker}
            value={value}
            setValue={setValue}
            inputRef={inputRef}
          />
        </Stack>
        <Box sx={{ height: 48, width: 48, backgroundColor: theme.palette.primary.main, borderRadius: 1.5 }}>
          <Stack sx={{ height: '100%', width: '100%' }} alignItems="center" justifyContent="center">
            <IconButton onClick={handleSendMessage}>
              <PaperPlaneTilt color="#fff" />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default Footer;