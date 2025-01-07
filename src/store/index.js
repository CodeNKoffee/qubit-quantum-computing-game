import { configureStore } from '@reduxjs/toolkit';
import { userSlice } from './userSlice';
import { settingsSlice } from './settingsSlice';

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    settings: settingsSlice.reducer,
  },
}); 