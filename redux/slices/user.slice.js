import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null,
  isAuthenticated: false,
  address: null,
  addresses: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload; // Guarda el usuario y el token
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.address = null;
      state.addresses = [];
    },
    logout: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.address = null;
      state.addresses = [];
    },
  },
});

export const { setUser, clearUser, logout } = userSlice.actions;
export default userSlice.reducer;
