import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ErrorBoundary } from './ErrorBoundary';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <WebSocketProvider>
            <AppDataProvider>
              <AppRoutes />
            </AppDataProvider>
          </WebSocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
