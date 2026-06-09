import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Global CSS Imports - Order matters!
import './styles/global.css';
import './styles/app-layout.css';
import './styles/login.css';
import './styles/setup.css';
import './styles/pages.css';
import './styles/responsive.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
