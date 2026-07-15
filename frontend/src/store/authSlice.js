import { createSlice } from '@reduxjs/toolkit';

const savedUser = localStorage.getItem('rensil_erp_user');

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
      localStorage.setItem('rensil_erp_user', JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('rensil_erp_user');
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('rensil_erp_user', JSON.stringify(state.user));
      }
    }
  },
});

export const { loginUser, logoutUser, updateUser } = authSlice.actions;
export default authSlice.reducer;
