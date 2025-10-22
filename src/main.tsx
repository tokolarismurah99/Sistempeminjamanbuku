import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Temporarily disabled StrictMode to prevent double-render in development
// StrictMode intentionally calls effects twice to help detect bugs
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
