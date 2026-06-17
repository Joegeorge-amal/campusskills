import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './ErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import GlobalNotificationListener from './components/common/GlobalNotificationListener';

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <WebSocketProvider>
            <ThemeProvider>
            <AppDataProvider>
              <GlobalNotificationListener />
              <AppRoutes />
            </AppDataProvider>
            </ThemeProvider>
          </WebSocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
