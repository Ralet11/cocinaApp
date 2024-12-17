import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null,
  isAuthenticated: false,
  address: null, // Aquí guardaremos la ubicación actual del usuario
  addresses: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload;
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
    setUserLocation: (state, action) => {
      // Aquí guardamos la latitud y longitud en address
      const { latitude, longitude } = action.payload;
      state.address = { latitude, longitude };
    },
  },
});

export const { setUser, clearUser, logout, setUserLocation } = userSlice.actions;
export default userSlice.reducer;
