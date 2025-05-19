import { createSlice } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import { updateUser } from './auth';

const initialState = {
  sidebar: {
    open: false,
    type: 'CONTACT',
  },
  snackbar: {
    open: null,
    message: null,
    severity: null,
  },
  users: [],
  friends: [],
  friendRequests: [],
  chat_type: null,
  room_id: null,
};

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebar.open = !state.sidebar.open;
    },
    updateSidebarType(state, action) {
      state.sidebar.type = action.payload.type;
    },
    openSnackbar(state, action) {
      state.snackbar.open = true;
      state.snackbar.severity = action.payload.severity;
      state.snackbar.message = action.payload.message;
    },
    closeSnackbar(state) {
      state.snackbar.open = false;
      state.snackbar.severity = null;
      state.snackbar.message = null;
    },
    updateUsers(state, action) {
      state.users = action.payload.users;
    },
    updateFriends(state, action) {
      state.friends = action.payload.friends;
    },
    updateFriendRequests(state, action) {
      state.friendRequests = action.payload.requests;
    },
    selectConversation(state, action) {
      state.chat_type = 'individual';
      state.room_id = action.payload.room_id;
    },
  },
});

export default slice.reducer;

export function ToggleSidebar() {
  return async (dispatch) => {
    dispatch(slice.actions.toggleSidebar());
  };
}

export function UpdateSidebarType(type) {
  return async (dispatch) => {
    dispatch(slice.actions.updateSidebarType({ type }));
  };
}

export function showSnackbar({ severity, message }) {
  return async (dispatch) => {
    dispatch(slice.actions.openSnackbar({ message, severity }));

    setTimeout(() => {
      dispatch(slice.actions.closeSnackbar());
    }, 4000);
  };
}

export function closeSnackbar() {
  return async (dispatch) => {
    dispatch(slice.actions.closeSnackbar());
  };
}

export function FetchUsers() {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    if (!token) {
      dispatch(showSnackbar({ severity: 'error', message: 'No authentication token found' }));
      return;
    }

    try {
      const response = await axios.get('/user/get-users', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      dispatch(slice.actions.updateUsers({ users: response.data.data }));
      dispatch(showSnackbar({ severity: 'success', message: response.data.message }));
    } catch (error) {
      console.log(error);
      dispatch(
        showSnackbar({
          severity: 'error',
          message: error.response?.data?.message || 'Failed to fetch users',
        })
      );
    }
  };
}

export function FetchFriends() {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    if (!token) {
      dispatch(showSnackbar({ severity: 'error', message: 'No authentication token found' }));
      return;
    }

    try {
      const response = await axios.get('/user/get-friends', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      dispatch(slice.actions.updateFriends({ friends: response.data.data }));
      dispatch(showSnackbar({ severity: 'success', message: response.data.message }));
    } catch (error) {
      console.log(error);
      dispatch(
        showSnackbar({
          severity: 'error',
          message: error.response?.data?.message || 'Failed to fetch friends',
        })
      );
    }
  };
}

export function FetchFriendRequests() {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    if (!token) {
      dispatch(showSnackbar({ severity: 'error', message: 'No authentication token found' }));
      return;
    }

    try {
      const response = await axios.get('/user/get-friend-requests', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      dispatch(slice.actions.updateFriendRequests({ requests: response.data.data }));
      dispatch(showSnackbar({ severity: 'success', message: response.data.message }));
    } catch (error) {
      console.log(error);
      dispatch(
        showSnackbar({
          severity: 'error',
          message: error.response?.data?.message || 'Failed to fetch friend requests',
        })
      );
    }
  };
}

export function UpdateUsers({ firstName, lastName, about, avatar }) {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    if (!token) {
      dispatch(showSnackbar({ severity: 'error', message: 'No authentication token found' }));
      throw new Error('No authentication token found');
    }

    try {
      const formData = new FormData();
      // Chỉ thêm các trường có giá trị để tránh gửi dữ liệu rỗng
      if (firstName) formData.append('firstName', firstName);
      if (lastName) formData.append('lastName', lastName);
      if (about) formData.append('about', about);
      if (avatar && avatar instanceof File) formData.append('avatar', avatar);

      // Log FormData để debug
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.patch('/user/update-me', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Không set Content-Type, để axios tự xử lý multipart/form-data
        },
      });

      // Kiểm tra response từ back-end
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to update profile');
      }

      const updatedUser = response.data.data.user;

      // Cập nhật danh sách users trong app slice
      const currentUsers = getState().app.users;
      const updatedUsers = currentUsers.map((user) =>
        user._id === updatedUser._id ? updatedUser : user
      );
      dispatch(slice.actions.updateUsers({ users: updatedUsers }));

      // Cập nhật user trong auth slice
      dispatch(updateUser(updatedUser));

      // Hiển thị snackbar thành công
      dispatch(showSnackbar({ severity: 'success', message: response.data.message }));

      return response.data;
    } catch (error) {
      console.error('UpdateUsers error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      dispatch(showSnackbar({ severity: 'error', message: errorMessage }));
      throw new Error(errorMessage);
    }
  };
}
export const SelectConversation = ({ room_id }) => {
  return async (dispatch) => {
    dispatch(slice.actions.selectConversation({ room_id }));
  };
};