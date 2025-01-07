import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  musicEnabled: true,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setMusicEnabled: (state, action) => {
      state.musicEnabled = action.payload;
      localStorage.setItem('musicEnabled', JSON.stringify(action.payload));
    },
    initializeFromStorage: (state) => {
      const storedMusicEnabled = localStorage.getItem('musicEnabled');
      if (storedMusicEnabled !== null) {
        state.musicEnabled = JSON.parse(storedMusicEnabled);
      }
    },
  },
});

export const { setMusicEnabled, initializeFromStorage } = settingsSlice.actions; 