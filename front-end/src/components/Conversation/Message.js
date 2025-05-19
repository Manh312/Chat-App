import { Box, Stack } from '@mui/material';
import React, { useEffect } from 'react';
import { DocMsg, LinkMsg, MediaMsg, ReplyMsg, TextMsg, TimeLine } from './MsgTypes';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../../socket';
import { FetchCurrentMessages, SetCurrentConversation, AddDirectMessage } from '../../redux/slices/conversation';

const Message = ({ menu }) => {
  const dispatch = useDispatch();
  const { conversations, current_messages } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const { room_id } = useSelector((state) => state.app);
  

  // Lấy tin nhắn ban đầu khi room_id thay đổi
  useEffect(() => {
  console.log('Message.js useEffect triggered.');
  console.log('Current room_id:', room_id);
  console.log('Conversations in state:', conversations);

  const current = conversations.find((el) => el?.id === room_id);
  console.log('Found conversation:', current);

  if (current) {
    // Tham gia phòng chat
    socket.emit('join_room', current.id);

    socket.emit('get_messages', { conversation_id: current.id }, (data) => {
      console.log('Messages received for conversation', current.id, ':', data);
      dispatch(FetchCurrentMessages({ messages: data.messages || [] }));
    });
    dispatch(SetCurrentConversation(current));
  } else {
    console.log('No conversation found for room_id:', room_id);
    dispatch(SetCurrentConversation(null));
    dispatch(FetchCurrentMessages({ messages: [] }));
  }
}, [conversations, room_id, dispatch]);

  // Lắng nghe tin nhắn mới từ Socket.IO
  useEffect(() => {
  const user_id = window.localStorage.getItem('user_id');

  const handleNewMessage = (data) => {
    console.log('New message received:', data);
    console.log('Current room_id:', room_id);
    console.log('Conversation_id from message:', data.conversation_id);

    if (data.conversation_id === room_id) {
      dispatch(AddDirectMessage({ message: data.message, conversation_id: data.conversation_id, room_id }));
    } else {
      console.log('Room ID does not match conversation ID');
    }
  };

  socket.on('new_message', handleNewMessage);

  return () => {
    socket.off('new_message', handleNewMessage);
  };
}, [room_id, dispatch]);


  return (
    <Box p={3}>
      <Stack spacing={3}>
        {current_messages.map((element) => {
          switch (element.type) {
            case 'divider':
              return <TimeLine element={element} />;
            case 'msg':
              switch (element.subtype) {
                case 'img':
                  return <MediaMsg element={element} menu={menu} />;
                case 'doc':
                  return <DocMsg element={element} menu={menu} />;
                case 'Link':
                  return <LinkMsg element={element} menu={menu} />;
                case 'reply':
                  return <ReplyMsg element={element} menu={menu} />;
                default:
                  return <TextMsg element={element} menu={menu} />;
              }
            default:
              return <></>;
          }
        })}
      </Stack>
    </Box>
  );
};

export default Message;