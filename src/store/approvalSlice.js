import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  requests: [],
};

const approvalSlice = createSlice({
  name: 'approvals',
  initialState,
  reducers: {
    setRequests: (state, action) => {
      state.requests = action.payload;
    },
    addRequest: (state, action) => {
      // Backend returns the complete request object including id, status, date
      state.requests.unshift(action.payload);
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

export const { setRequests, addRequest, updateRequestStatus } = approvalSlice.actions;
export default approvalSlice.reducer;
