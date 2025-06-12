// frontend/redux/slices/user.slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo:        null,
  token:           null,
  isAuthenticated: false,
  addresses:       [],
  currentAddress:  null,
  language:        "es",    // idioma por defecto
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    /* payload: { user, token }  ó  solo user */
    setUser: (state, action) => {
      if (action.payload?.user) {
        state.userInfo = action.payload.user;
        state.token    = action.payload.token ?? state.token;
      } else {
        state.userInfo = action.payload;
      }
      state.isAuthenticated = true;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    clearUser: () => ({ ...initialState }),
    logout:    () => ({ ...initialState }),
    setAddresses:      (state, action) => { state.addresses      = action.payload; },
    setCurrentAddress: (state, action) => { state.currentAddress = action.payload; },
    // Guarda la selección de idioma ("es" o "en")
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const {
  setUser,
  setToken,
  clearUser,
  logout,
  setAddresses,
  setCurrentAddress,
  setLanguage,
} = userSlice.actions;

export default userSlice.reducer;
