import { createSlice } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import { showSnackbar } from './app';

const initialState = {
  isLoading: false,
  isLoggedIn: false,
  token: '',
  email: '',
  error: false,
  user: null,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateIsLoading(state, action) {
      state.error = action.payload.error;
      state.isLoading = action.payload.isLoading;
    },
    login(state, action) {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    signOut(state) {
      state.isLoggedIn = false;
      state.token = '';
      state.user = null;
    },
    updateRegisterEmail(state, action) {
      state.email = action.payload.email;
    },
    updateUser(state, action) {
      state.user = action.payload;
    },
  },
});

export default slice.reducer;
export const { updateUser } = slice.actions;

export function LoginUser(formValues) {
  return async (dispatch, getState) => {
    try {
      const response = await axios.post(
        '/auth/login',
        { ...formValues },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log(response);
      dispatch(
        slice.actions.login({
          isLoggedIn: true,
          token: response.data.token,
          user: response.data.user,
        })
      );
      window.localStorage.setItem('user_id', response.data.user_id);
      dispatch(showSnackbar({ severity: 'success', message: response.data.message }));
    } catch (error) {
      console.log(error);
      dispatch(showSnackbar({ severity: 'error', message: error.response.data.message }));
    }
  };
}

export function LogoutUser() {
  return async (dispatch, getState) => {
    window.localStorage.removeItem('user_id');
    dispatch(slice.actions.signOut());
  };
}

export function ForgotPassword(formValues) {
  return async (dispatch, getState) => {
    try {
      const response = await axios.post(
        '/auth/forgot-password',
        { ...formValues },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log(response);
      dispatch(showSnackbar({ severity: 'success', message: response.data.message }));
    } catch (error) {
      console.log(error);
      dispatch(showSnackbar({ severity: 'error', message: error.response.data.message }));
    }
  };
}

export function NewPassword(formValues) {
  return async (dispatch, getState) => {
    try {
      const response = await axios.post(
        '/auth/reset-password',
        { ...formValues },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log(response);
      dispatch(
        slice.actions.login({
          isLoggedIn: true,
          token: response.data.token,
          user: response.data.user,
        })
      );
      dispatch(showSnackbar({ severity: 'success', message: response.data.message }));
    } catch (error) {
      console.log(error);
      dispatch(showSnackbar({ severity: 'error', message: error.response.data.message }));
    }
  };
}

export function RegisterUser(formValues) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    try {
      const response = await axios.post(
        '/auth/register',
        { ...formValues },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log(response);
      dispatch(
        slice.actions.updateRegisterEmail({
          email: formValues.email,
        })
      );
      dispatch(slice.actions.updateIsLoading({ isLoading: false, error: false }));
      dispatch(showSnackbar({ severity: 'success', message: response.data.message }));
    } catch (error) {
      console.log(error);
      dispatch(slice.actions.updateIsLoading({ isLoading: false, error: true }));
      dispatch(showSnackbar({ severity: 'error', message: error.response.data.message }));
    } finally {
      if (!getState().auth.error) {
        window.location.href = '/auth/verify';
      }
    }
  };
}

export function VerifyEmail(formValues) {
  return async (dispatch, getState) => {
    try {
      const response = await axios.post(
        '/auth/verify',
        { ...formValues },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log(response);
      dispatch(
        slice.actions.login({
          isLoggedIn: true,
          token: response.data.token,
          user: response.data.user,
        })
      );
      window.localStorage.setItem('user_id', response.data.user_id);
      dispatch(showSnackbar({ severity: 'success', message: response.data.message }));
    } catch (error) {
      console.log(error);
      dispatch(showSnackbar({ severity: 'error', message: error.response.data.message }));
    }
  };
}