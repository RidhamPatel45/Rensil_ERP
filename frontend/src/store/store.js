import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import notificationReducer from './notificationSlice';
import approvalReducer from './approvalSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    approvals: approvalReducer,
  },
});
