
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { LanguageProvider } from './contexts/LanguageContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

const AppContent: React.FC = () => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <HomePage /> : <LoginPage />;
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
