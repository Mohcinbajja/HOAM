
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  updateCredentials: (newUser: string, newPass: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(() => localStorage.getItem('hoa-username') || 'admin');
  const [password, setPassword] = useState(() => localStorage.getItem('hoa-password') || 'admin');

  useEffect(() => {
    localStorage.setItem('hoa-username', username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem('hoa-password', password);
  }, [password]);


  const login = (user: string, pass: string): boolean => {
    if (user === username && pass === password) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
  };
  
  const updateCredentials = (newUser: string, newPass: string) => {
    setUsername(newUser);
    setPassword(newPass);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
