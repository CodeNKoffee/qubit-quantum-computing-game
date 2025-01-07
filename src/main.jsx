import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './store';
import { initializeFromStorage as initUser } from './store/userSlice';
import { initializeFromStorage as initSettings } from './store/settingsSlice';

// Initialize state from localStorage
store.dispatch(initUser());
store.dispatch(initSettings());

// Create root and render
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React>
    <Provider store={store}>
      <App />
    </Provider>
  </React>
);
