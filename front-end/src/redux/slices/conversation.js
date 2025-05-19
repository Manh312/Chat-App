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
      const newMessage = action.payload.message;
      console.log("addDirectMessage received payload:", action.payload);
      console.log("addDirectMessage received message:", newMessage);

      // Đảm bảo tin nhắn có đầy đủ thông tin cần thiết
      if (!newMessage || !newMessage.id) {
        console.error("Invalid message format:", newMessage);
        return;
      }

      // Kiểm tra xem tin nhắn đã tồn tại chưa (có thể dựa vào _id từ server)
      const messageExists = state.direct_chat.current_messages.some(
        (message) => message.id === newMessage.id
      );

      if (!messageExists) {
        // Thêm tin nhắn mới vào state
        // Cần đảm bảo cấu trúc tin nhắn thêm vào khớp với cấu trúc được render
        const formattedMessage = {
          id: newMessage._id, // Sử dụng _id từ server làm id chính thức
          type: newMessage.type || 'msg',
          subtype: newMessage.subtype,
          message: newMessage.message || newMessage.text,
          incoming: newMessage.incoming !== undefined ? newMessage.incoming : newMessage.to === window.localStorage.getItem('user_id'),
          outgoing: newMessage.outgoing !== undefined ? newMessage.outgoing : newMessage.from === window.localStorage.getItem('user_id'),
          createdAt: newMessage.createdAt, // Thêm thời gian tạo
          isRead: newMessage.isRead, // Thêm trạng thái đã đọc
        };

        // Thay vì push, tạo mảng mới để đảm bảo tính immutable
        state.direct_chat.current_messages = [...state.direct_chat.current_messages, formattedMessage];
        
        // Cập nhật tin nhắn cuối cùng trong danh sách cuộc trò chuyện
        const conversationIndex = state.direct_chat.conversations.findIndex(
          (conv) => conv.id === (state.direct_chat.current_conversation?.id || newMessage.conversation_id) // Sử dụng conversation_id từ message nếu cần
        );
        
        if (conversationIndex !== -1) {
          state.direct_chat.conversations[conversationIndex].msg = formattedMessage.message;
          state.direct_chat.conversations[conversationIndex].time = formattedMessage.createdAt;
          // Tăng unreadCount cho người nhận nếu tin nhắn đến
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

export const AddDirectMessage = (message) => {
  return async (dispatch, getState) => {
    console.log("AddDirectMessage dispatching:", message);
    dispatch(slice.actions.addDirectMessage({ message }));
  };
};