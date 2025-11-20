import React, { useState, useCallback, useEffect } from 'react';
import LoginScreenModern from './components/LoginScreenModern'; // NEW IMPORT
import MainLayout from './components/MainLayout';
import { User, ManagedUser } from './types';
import { MOCK_USERS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appVersion, setAppVersion] = useState(1000); // Major version jump
  
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => {
    try {
      const savedUsers = localStorage.getItem('farmaciaEleam_users');
      return savedUsers ? JSON.parse(savedUsers) : MOCK_USERS;
    } catch (error) {
      return MOCK_USERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('farmaciaEleam_users', JSON.stringify(managedUsers));
    } catch (error) {
      console.error(error);
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
    return <LoginScreenModern key={`login-v3-${appVersion}`} users={managedUsers} onLogin={handleLogin} />;
  }

  return <MainLayout 
           key={`layout-v3-${appVersion}`}
           user={user} 
           onLogout={handleLogout} 
           users={managedUsers} 
           setUsers={setManagedUsers}
         />;
};

export default App;