import React, { useState, useCallback, useEffect } from 'react';
import LoginScreenModern from './components/LoginScreenModern';
import MainLayout from './components/MainLayout';
import { User, ManagedUser } from './types';
import { MOCK_USERS } from './constants';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appVersion, setAppVersion] = useState(1000); // Major version jump
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);

  // Fetch users from Supabase on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('app_users')
          .select('*');

        if (error) {
          console.error('Error fetching users from Supabase:', error);
          // Fallback to mock users if DB fails or is empty initially (safety net)
          setManagedUsers(MOCK_USERS);
        } else {
          if (data && data.length > 0) {
            setManagedUsers(data as ManagedUser[]);
          } else {
            // If DB is empty, use mock users so admin can login and sync
            setManagedUsers(MOCK_USERS);
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching users:', err);
        setManagedUsers(MOCK_USERS);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

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

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Conectando con la base de datos...</p>
        </div>
      </div>
    );
  }

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