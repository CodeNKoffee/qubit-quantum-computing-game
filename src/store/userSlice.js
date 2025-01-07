import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isGuest: false,
  loading: true,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isGuest = false;
      state.loading = false;
      // Save to localStorage
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('user');
      }
    },
    setGuest: (state, action) => {
      state.isGuest = action.payload;
      state.user = null;
      state.loading = false;
      localStorage.setItem('isGuest', JSON.stringify(action.payload));
    },
    signOut: (state) => {
      state.user = null;
      state.isGuest = false;
      state.loading = false;
      localStorage.removeItem('user');
      localStorage.removeItem('isGuest');
    },
    initializeFromStorage: (state) => {
      const storedUser = localStorage.getItem('user');
      const storedIsGuest = localStorage.getItem('isGuest');

      if (storedUser) {
        state.user = JSON.parse(storedUser);
        state.isGuest = false;
      } else if (storedIsGuest === 'true') {
        state.isGuest = true;
      }
      state.loading = false;
    },
  },
});

export const { setUser, setGuest, signOut, initializeFromStorage } = userSlice.actions; 