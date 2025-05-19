import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Box, Stack } from '@mui/material';
import Message from './Message';
import { SimpleBarStyle } from '../Scrollbar';
import { useSelector } from 'react-redux';

const Conversation = () => {
  const { conversations } = useSelector((state) => state.conversation.direct_chat);
  const { room_id } = useSelector((state) => state.app);

  // Tìm conversation đang được chọn
  const currentConversation = conversations.find((element) => element.id === room_id);

  return (
    <Stack height={'100%'} maxHeight={'100vh'} width={'auto'}>
      {/* Chat Header*/}
      {currentConversation && <Header key={currentConversation.id} {...currentConversation} />}
      {/* Chat Middler*/}
      <Box width={'100%'} sx={{ flexGrow: 1, overflow: "hidden", height: "100%" }}>
        <SimpleBarStyle timeout={500} style={{ height: "100%" }} clickOnTrack={false}>
          <Message menu={true} />
        </SimpleBarStyle>
      </Box>
      {/* Chat Footer*/}
      <Footer />
    </Stack>
  );
}

export default Conversation;
