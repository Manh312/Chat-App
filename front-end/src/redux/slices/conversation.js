import { createSlice } from "@reduxjs/toolkit";
import { showSnackbar } from './app';

const user_id = window.localStorage.getItem('user_id');

const initialState = {
  direct_chat: {
    conversations: [],
    current_conversation: null,
    current_messages: [],
  },
  group_chat: {},
};

const slice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    fetchDirectConversations(state, action) {
      const list = action.payload.conversations.map((element) => {
        const this_user = element.participants.find((elm) => elm._id.toString() !== user_id);

        const lastMessage = element.lastMessage || null;
        const unreadCount = element.unreadCount || 0;

        return {
          id: element._id,
          user_id: this_user._id,
          name: `${this_user.firstName} ${this_user.lastName}`,
          online: this_user.status === 'Online',
          img: this_user.avatar && typeof this_user.avatar === "string" && this_user.avatar.trim() !== ""
            ? this_user.avatar
            : '/default-avatar.png',
          msg: lastMessage?.text || 'No messages yet',
          time: lastMessage?.createdAt,
          createdAt: lastMessage?.createdAt,
          unread: unreadCount,
          pinned: element.pinned || false,
        };
      });
      console.log("fetchDirectConversations: ", list);
      state.direct_chat.conversations = list;
    },
    updateDirectConversation(state, action) {
      const this_conversation = action.payload.conversation;
      state.direct_chat.conversations = state.direct_chat.conversations.map((element) => {
        if (element.id !== this_conversation._id) {
          return element;
        } else {
          const user = this_conversation.participants.find((element) => element._id.toString() !== user_id);

          const lastMessage = this_conversation.messages?.length > 0
            ? this_conversation.messages[this_conversation.messages.length - 1]
            : null;

          const unreadCount = this_conversation.messages?.filter(
            (msg) => msg.to === user_id && !msg.read
          ).length || 0;

          return {
            id: this_conversation._id,
            user_id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            online: user.status === 'Online',
            img: user.avatar && typeof user.avatar === "string" && user.avatar.trim() !== ""
              ? user.avatar
              : '/default-avatar.png',
            msg: lastMessage?.text || 'No messages yet',
            time: lastMessage?.createdAt,
            createdAt: lastMessage?.createdAt,
            unread: unreadCount,
            pinned: this_conversation.pinned || false,
          };
        }
      });
    },
    addDirectConversation(state, action) {
      const this_conversation = action.payload.conversation;
      const user = this_conversation.participants.find((element) => element._id.toString() !== user_id);

      const lastMessage = this_conversation.messages?.length > 0
        ? this_conversation.messages[this_conversation.messages.length - 1]
        : null;

      const unreadCount = this_conversation.messages?.filter(
        (msg) => msg.to === user_id && !msg.read
      ).length || 0;

      const newConversation = {
        id: this_conversation._id,
        user_id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        online: user.status === 'Online',
        img: user.avatar && typeof user.avatar === "string" && user.avatar.trim() !== ""
          ? user.avatar
          : '/default-avatar.png',
        msg: lastMessage?.text || 'No messages yet',
        time: lastMessage?.createdAt,
        createdAt: lastMessage?.createdAt,
        unread: unreadCount,
        pinned: this_conversation.pinned || false,
      };

      state.direct_chat.conversations.push(newConversation);
    },
    setCurrentConversation(state, action) {
      state.direct_chat.current_conversation = action.payload;
    },
    fetchCurrentMessages(state, action) {
      let messages = action.payload.messages;
      if (!Array.isArray(messages)) {
        if (messages && Array.isArray(messages.messages)) {
          messages = messages.messages;
        } else {
          messages = [];
        }
      }
      const formatted_messages = messages.map((el) => ({
        id: el._id,
        type: "msg",
        subtype: el.type,
        message: el.text,
        incoming: el.to === user_id,
        outgoing: el.from === user_id,
      }));
      state.direct_chat.current_messages = formatted_messages;
    },
    addDirectMessage(state, action) {
      const { message, conversation_id, room_id } = action.payload;
      console.log("addDirectMessage received payload:", action.payload);

      if (!message || !message._id) {
        console.error("Invalid message format:", message);
        return;
      }

      const messageExists = state.direct_chat.current_messages.some(
        (msg) => msg.id === message._id
      );

      if (!messageExists) {
        const formattedMessage = {
          id: message._id,
          type: message.type || 'msg',
          subtype: message.subtype || (message.text ? 'text' : undefined),
          message: message.text || message.message,
          incoming: message.to === window.localStorage.getItem('user_id'),
          outgoing: message.from === window.localStorage.getItem('user_id'),
          createdAt: message.createdAt,
          isRead: message.isRead || false,
        };

        // Thêm tin nhắn nếu conversation_id khớp với room_id hoặc current_conversation
        if (conversation_id === room_id || state.direct_chat.current_conversation?.id === conversation_id) {
          state.direct_chat.current_messages = [...state.direct_chat.current_messages, formattedMessage];
        }

        // Cập nhật danh sách cuộc trò chuyện
        const conversationIndex = state.direct_chat.conversations.findIndex(
          (conv) => conv.id === conversation_id
        );
        if (conversationIndex !== -1) {
          state.direct_chat.conversations[conversationIndex].msg = formattedMessage.message;
          state.direct_chat.conversations[conversationIndex].time = formattedMessage.createdAt;
          if (formattedMessage.incoming) {
            state.direct_chat.conversations[conversationIndex].unread = (state.direct_chat.conversations[conversationIndex].unread || 0) + 1;
          }
        }
      }
    },
  },
});

export default slice.reducer;

export const FetchDirectConversations = ({ conversations }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.fetchDirectConversations({ conversations }));
    dispatch(showSnackbar({ severity: 'success', message: 'Conversation show successfully' }));
  };
};

export const AddDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.addDirectConversation({ conversation }));
    dispatch(showSnackbar({ severity: 'success', message: 'Conversation created' }));
  };
};

export const UpdateDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateDirectConversation({ conversation }));
    dispatch(showSnackbar({ severity: 'success', message: 'Conversation updated' }));
  };
};

export const SetCurrentConversation = (current_conversation) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.setCurrentConversation(current_conversation));
  };
};

export const FetchCurrentMessages = ({ messages }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.fetchCurrentMessages({ messages }));
  };
};

export const AddDirectMessage = ({ message, conversation_id, room_id }) => {
  return async (dispatch, getState) => {
    console.log("AddDirectMessage dispatching:", { message, conversation_id, room_id });
    dispatch(slice.actions.addDirectMessage({ message, conversation_id, room_id }));
  };
};