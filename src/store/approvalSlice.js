import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  requests: [
    { id: 'REQ-01', subject: 'New Supplier Registration: Elite Wools', requestedBy: 'Jane Manager', date: '2023-10-24', status: 'Pending', description: 'Requesting approval for a new wool supplier based in New Zealand.' },
    { id: 'REQ-02', subject: 'Override Production Limit', requestedBy: 'Bill Worker', date: '2023-10-25', status: 'Pending', description: 'Need to override the limit for the current night shift to meet deadline.' },
    { id: 'REQ-03', subject: 'Budget Extension: Sales Team', requestedBy: 'Mark Sales', date: '2023-10-26', status: 'Approved', description: 'Quarterly budget extension for regional marketing campaign.' },
    { id: 'REQ-04', subject: 'Emergency Leave Request', requestedBy: 'John Dave', date: '2023-10-27', status: 'Rejected', description: 'Requesting leave for personal reasons during peak production week.' },
  ],
};

const approvalSlice = createSlice({
  name: 'approvals',
  initialState,
  reducers: {
    addRequest: (state, action) => {
      state.requests.unshift({
        id: `REQ-${String(state.requests.length + 1).padStart(2, '0')}`,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        ...action.payload
      });
    },
    updateRequestStatus: (state, action) => {
      const { id, status } = action.payload;
      const request = state.requests.find(req => req.id === id);
      if (request) {
        request.status = status;
      }
    },
  },
});

export const { addRequest, updateRequestStatus } = approvalSlice.actions;
export default approvalSlice.reducer;
