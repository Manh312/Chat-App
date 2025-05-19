import { Stack } from "@mui/material";
import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, socket } from "../../socket";
import { SelectConversation, showSnackbar } from "../../redux/slices/app";
import { AddDirectConversation, AddDirectMessage, UpdateDirectConversation, FetchDirectConversations } from "../../redux/slices/conversation";

const DashboardLayout = () => {

  const {isLoggedIn} = useSelector((state) => state.auth);
  const {conversations, current_conversation} = useSelector((state) => state.conversation.direct_chat);
  const user_id = window.localStorage.getItem('user_id');
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(conversations)
    if (isLoggedIn) {
      window.onload = function () {
        if (!window.location.hash) {
          window.location = window.location + '#loaded';
          window.location.reload();
        }
      };

      if (!socket) {
        connectSocket(user_id);
      }

      socket.on('new_friend_request', (data) => {
        dispatch(showSnackbar({severity: 'success', message: data.message}));
      });
      socket.on('request_accepted', (data) => {
        dispatch(showSnackbar({severity: 'success', message: data.message}));
      });
      socket.on('request_sent', (data) => {
        dispatch(showSnackbar({severity: 'success', message: data.message}));
      });
      socket.on('start_chat', (data) => {
        console.log(data);
        const existing_conversation = conversations.find((element) => element.id === data._id);
        if (existing_conversation) {
          dispatch(UpdateDirectConversation({conversation: data}));
        } else {
          dispatch(AddDirectConversation({conversation: data}));
        }
        dispatch(SelectConversation({room_id: data._id}));
      });
      socket.on("new_message", (data) => {
        const message = data.message;
        console.log("new_message received in DashboardLayout: ", data);
        if (current_conversation?.id !== data.conversation_id) {
          console.log("New message for another conversation, update sidebar");
          const user_id = window.localStorage.getItem('user_id');
          if (user_id) {
            socket.emit('get_direct_conversations', { user_id }, (updatedConversations) => {
              if (updatedConversations && Array.isArray(updatedConversations)) {
                console.log('Conversations updated after new message:', updatedConversations);
                dispatch(FetchDirectConversations({ conversations: updatedConversations }));
              } else {
                console.error('Invalid updated conversations data after new message:', updatedConversations);
              }
            });
          }
        } else {
          console.log("New message for current conversation, Message.js will handle");
        }
      });
    };
    return () => {
      socket?.off('new_friend_request');
      socket?.off('request_accepted');
      socket?.off('request_sent');
      socket?.off('start_chat');
    }
  },[isLoggedIn, conversations, current_conversation, dispatch, user_id]);

  if (!isLoggedIn) {
    return <Navigate to={'/auth/login'}/>
  }

  return (
    <>
      <Stack direction={"row"}>
        {/* Sidebar */}
        <Sidebar />
        <Outlet />
      </Stack>
    </>
  );
};

export default DashboardLayout;
