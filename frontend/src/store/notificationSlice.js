import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [
    {
      id: 'welcome-01',
      title: 'System Initialized',
      message: 'Welcome to the Rug Factory System dashboard.',
      timestamp: new Date().toISOString(),
      read: false,
      targetRole: 'Admin' // Default to Admin
    }
  ],
  unreadCount: 1,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const newNotification = {
        id: Date.now().toString(),
        title: action.payload.title,
        message: action.payload.message,
        targetRole: action.payload.targetRole || 'Admin', // Default to Admin if not specified
        timestamp: new Date().toISOString(),
        read: false,
      };
      // Add to front of list
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    },
    markAllRead: (state) => {
      state.notifications.forEach(n => { n.read = true; });
      state.unreadCount = 0;
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        // Note: Global unreadCount management becomes complex with role filtering.
        // We'll calculate display unreadCount in the component instead.
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    }
  },
});

export const { addNotification, markAllRead, markAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
