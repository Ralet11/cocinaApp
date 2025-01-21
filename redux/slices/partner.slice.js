import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  partner_id: null
};

const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {
    setPartnerId(state, action) {
      state.partner_id = action.payload;
    },
  },
});

export const { setPartnerId } = partnerSlice.actions;
export default partnerSlice.reducer;
