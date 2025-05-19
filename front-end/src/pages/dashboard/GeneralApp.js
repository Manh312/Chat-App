import React, { Suspense, lazy } from "react";
import Chats from "./Chats";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Conversation from "../../components/Conversation"
import Contact from "../../components/Contact";
import { useSelector } from "react-redux";
import SharedMessage from "../../components/SharedMessage";
import StarredMessage from "../../components/StarredMessage";
import NoChatSVG from "../../assets/Illustration/NoChat";

// const Cat = lazy(() => import("../../components/Cat"))

const GeneralApp = () => {
  const theme = useTheme();
  const { sidebar, chat_type, room_id } = useSelector((store) => store.app);

  return (
    <>
      {/* <Suspense fallback="Loading...">
        <Cat/>
      </Suspense> */}
      <Stack direction={'row'} sx={{ width: '100%' }}>
        {/* Chats */}
        <Chats />
        <Box sx={{
          height: '100%',
          width: sidebar.open ? 'calc(100vw - 740px)' : 'calc(100vw - 420px)',
          backgroundColor: theme.palette.mode === 'light' ? '#F0F4FA' : theme.palette.background.default,
        }} >
          {/* Conversation */}
          {room_id !== null && chat_type === 'individual' ? <Conversation/> : 
            <Stack spacing={2} sx={{height: '100%', width: '100%'}} alignItems={'center'} justifyContent={'center'}>
              <NoChatSVG/>
              <Typography variant="subtitle2">Select a conversation or start a new one</Typography>
            </Stack>
          }
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
    </>
  );
};

export default GeneralApp;
