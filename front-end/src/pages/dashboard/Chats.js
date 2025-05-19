import { Box, Button, Divider, IconButton, Stack, Typography } from '@mui/material';
import { ArchiveBox, CircleDashed, MagnifyingGlass, User } from 'phosphor-react';
import React, { useEffect, useState } from 'react';
import { SimpleBarStyle } from '../../components/Scrollbar';
import { Search, SearchIconWrapper, StyledInputBase } from '../../components/Search';
import ChatElement from '../../components/ChatElement';
import Friends from '../../sections/main/Friends';
import { socket } from '../../socket';
import { useDispatch, useSelector } from 'react-redux';
import { FetchDirectConversations } from '../../redux/slices/conversation';
import { FetchFriends } from '../../redux/slices/app';

const Chats = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Thêm trạng thái loading
  const dispatch = useDispatch();
  const { conversations } = useSelector((state) => state.conversation.direct_chat || { conversations: [] });
  const user_id = window.localStorage.getItem('user_id');

  useEffect(() => {
    if (!user_id) {
      console.error('User ID not found in localStorage');
      setIsLoading(false);
      return;
    }

    // Lấy danh sách cuộc trò chuyện ban đầu qua Socket.IO
    socket.emit('get_direct_conversations', { user_id }, (data) => {
      if (data && Array.isArray(data)) {
        console.log('Conversations received:', data);
        dispatch(FetchDirectConversations({ conversations: data }));
      } else {
        console.error('Invalid conversations data:', data);
        dispatch(FetchDirectConversations({ conversations: [] }));
      }
      setIsLoading(false); // Dừng loading sau khi nhận dữ liệu
    });

    // Lắng nghe cập nhật cuộc trò chuyện (tin nhắn mới hoặc thay đổi trạng thái)
    const handleConversationUpdate = (data) => {
      if (data && Array.isArray(data)) {
        console.log('Conversations updated:', data);
        dispatch(FetchDirectConversations({ conversations: data }));
      } else {
        console.error('Invalid updated conversations data:', data);
        dispatch(FetchDirectConversations({ conversations: [] }));
      }
    };
    socket.on('direct_conversations_updated', handleConversationUpdate);

    // Lấy danh sách bạn bè qua REST API
    dispatch(FetchFriends());

    // Cleanup khi component unmount
    return () => {
      socket.off('direct_conversations_updated', handleConversationUpdate);
    };
  }, [dispatch, user_id]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: 320,
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background.paper,
          boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)',
        }}
      >
        <Stack p={3} spacing={2} sx={{ height: '100vh' }}>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Typography variant='h5'>Chats</Typography>
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <IconButton onClick={handleOpenDialog}>
                <User />
              </IconButton>
              <IconButton>
                <CircleDashed />
              </IconButton>
            </Stack>
          </Stack>
          <Stack sx={{ width: '100%' }}>
            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color='#709CE6' />
              </SearchIconWrapper>
              <StyledInputBase placeholder='Search...' inputProps={{ 'aria-label': 'search' }} />
            </Search>
          </Stack>
          <Stack spacing={1}>
            <Stack direction={'row'} alignItems={'center'} spacing={1.5}>
              <ArchiveBox size={24} />
              <Button>Archive</Button>
            </Stack>
            <Divider />
          </Stack>
          <Stack spacing={2} direction={'column'} sx={{ flexGrow: 1, overflow: 'hidden', height: '100%' }}>
            <SimpleBarStyle timeout={500} style={{ height: '100%' }} clickOnTrack={false}>
              <Stack spacing={2.4}>
                <Typography variant='subtitle2' sx={{ color: '#676767' }}>
                  All Chats
                </Typography>
                {isLoading ? (
                  <Typography variant="body2" sx={{ color: '#676767', textAlign: 'center' }}>
                    Loading conversations...
                  </Typography>
                ) : !user_id ? (
                  <Typography variant="body2" sx={{ color: '#676767', textAlign: 'center' }}>
                    Please log in to view conversations
                  </Typography>
                ) : Array.isArray(conversations) && conversations.length > 0 ? (
                  conversations.map((element) => (
                    <ChatElement
                      key={element.id}
                      id={element.id}
                      user_id={element.user_id}
                      name={element.name}
                      img={element.img}
                      msg={element.msg}
                      time={element.time}
                      unread={element.unread}
                      online={element.online}
                      createdAt={element.createdAt}
                    />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#676767', textAlign: 'center' }}>
                    No conversations available
                  </Typography>
                )}
              </Stack>
            </SimpleBarStyle>
          </Stack>
        </Stack>
      </Box>
      {openDialog && <Friends open={openDialog} handleClose={handleCloseDialog} />}
    </>
  );
};

export default Chats;