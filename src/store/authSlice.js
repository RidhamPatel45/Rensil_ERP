import { createSlice } from '@reduxjs/toolkit';

const savedUser = localStorage.getItem('rug_factory_user');

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedUser,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('rug_factory_user', JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('rug_factory_user');
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('rug_factory_user', JSON.stringify(state.user));
      }
    }
  },
});

export const { loginUser, logoutUser, updateUser } = authSlice.actions;
export default authSlice.reducer;
