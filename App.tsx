import React, { useState, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import MainLayout from './components/MainLayout';
import { User } from './types';
import { USER_CREDENTIALS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = useCallback((userToLogin: Omit<User, 'name'>) => {
    const credentials = USER_CREDENTIALS[userToLogin.role];
    if(credentials) {
      setUser({
        role: userToLogin.role,
        permissions: userToLogin.permissions,
        name: credentials.name
      });
    }
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
  }, []);

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <MainLayout user={user} onLogout={handleLogout} />;
};

export default App;
