import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null,
  isAuthenticated: false,
  addresses: [], // Lista de direcciones del usuario
  currentAddress: null, // Dirección actual seleccionada
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
      state.addresses = [];
      state.currentAddress = null;
    },
    logout: (state) => {
      return { ...initialState }; // Reinicia el estado completo al inicial
    },
    setAddresses: (state, action) => {
      state.addresses = action.payload;
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
  },
});

export const {
  setUser,
  clearUser,
  logout,
  setAddresses,
  setCurrentAddress,
} = userSlice.actions;

export default userSlice.reducer;
