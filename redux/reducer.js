// reducer.js
import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importa tus slices
import userReducer from './slices/user.slice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user'],
};

const appReducer = combineReducers({
  user: userReducer,
});

const rootReducer = (state, action) => {
  // Si se dispara la acción 'user/logout', se resetea todo el estado
  if (action.type === 'user/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default persistedReducer;
