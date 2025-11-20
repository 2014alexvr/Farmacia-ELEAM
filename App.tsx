
import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import MainLayout from './components/MainLayout';
import { User, ManagedUser } from './types';
import { MOCK_USERS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appVersion, setAppVersion] = useState(5); // Versión incrementada para forzar recarga
  
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => {
    try {
      const savedUsers = localStorage.getItem('farmaciaEleam_users');
      return savedUsers ? JSON.parse(savedUsers) : MOCK_USERS;
    } catch (error) {
      console.error("Error al cargar usuarios desde localStorage", error);
      return MOCK_USERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('farmaciaEleam_users', JSON.stringify(managedUsers));
    } catch (error) {
      console.error("Error al guardar usuarios en localStorage", error);
    }
  }, [managedUsers]);

  const handleLogin = useCallback((userId: string, passwordAttempt: string): boolean => {
    const userToLogin = managedUsers.find(u => u.id === userId);
    
    if (userToLogin && userToLogin.password === passwordAttempt) {
      setUser({
        role: userToLogin.role,
        name: userToLogin.name,
        permissions: userToLogin.permissions,
      });
      setAppVersion(v => v + 1);
      return true;
    }
    return false;
  }, [managedUsers]);

  const handleLogout = useCallback(() => {
    setUser(null);
  }, []);

  if (!user) {
    return <LoginScreen key={`login-refresh-${appVersion}`} users={managedUsers} onLogin={handleLogin} />;
  }

  return <MainLayout 
           key={`layout-refresh-${appVersion}`}
           user={user} 
           onLogout={handleLogout} 
           users={managedUsers} 
           setUsers={setManagedUsers}
         />;
};

export default App;
