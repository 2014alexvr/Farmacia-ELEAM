
import React, { useState, useMemo } from 'react';
import { UserRole, ManagedUser } from '../types';
import PillIcon from './icons/PillIcon';
import CloseIcon from './icons/CloseIcon';

interface LoginScreenProps {
  users: ManagedUser[];
  onLogin: (userId: string, passwordAttempt: string) => boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const roles = Object.values(UserRole);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const usersForSelectedRole = useMemo(() => {
    if (!selectedRole) return [];
    return users.filter(u => u.role === selectedRole);
  }, [selectedRole, users]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const firstUserInRole = users.find(u => u.role === role);
    setSelectedUserId(firstUserInRole ? firstUserInRole.id : '');
    setError('');
    setPassword('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    const success = onLogin(selectedUserId, password);
    if (!success) {
      setError('Contraseña incorrecta. Por favor, intente de nuevo.');
    }
  };

  const closeModal = () => {
    setSelectedRole(null);
  };

  const selectedUserName = users.find(u => u.id === selectedUserId)?.name || '';

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-brand-dark">
        <div className="w-full max-w-md p-10 space-y-8 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl animate-fade-in-down border border-white/20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-brand-light rounded-2xl shadow-inner">
                <PillIcon className="w-12 h-12 text-brand-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">FARMACIA ELEAM</h1>
            <h2 className="text-xl font-semibold text-brand-primary tracking-wide mt-1">EL NAZARENO</h2>
            <p className="mt-4 text-sm font-medium text-slate-500 uppercase tracking-wider">Gestión de Medicamentos</p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-center text-slate-400 uppercase tracking-widest mb-4">Seleccione Perfil</h3>
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className="w-full px-6 py-4 text-lg font-semibold text-slate-700 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-brand-light hover:border-brand-secondary hover:text-brand-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 active:scale-[0.98]"
              >
                {role}
              </button>
            ))}
          </div>
          <p className="text-xs text-center text-slate-400 mt-8 font-medium">© 2025 ELEAM Solutions. Versión Segura.</p>
        </div>
      </div>

      {selectedRole && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative animate-scale-in overflow-hidden">
            <div className="bg-brand-primary px-8 py-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white">Bienvenido</h2>
                 <button onClick={closeModal} className="text-white/80 hover:text-white transition-colors bg-white/10 p-1 rounded-full hover:bg-white/20">
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-brand-light mt-1 opacity-90">
                  Ingreso como <span className="font-bold">{selectedRole}</span>
              </p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="p-8 pt-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="user-select" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Usuario</label>
                  <div className="relative">
                    <select
                      id="user-select"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="block w-full pl-4 pr-10 py-3 text-base border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary rounded-xl transition-shadow text-slate-800 font-medium appearance-none cursor-pointer"
                    >
                      {usersForSelectedRole.map(user => (
                        <option key={user.id} value={user.id} className="text-slate-800">{user.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 border-slate-200 bg-slate-100 text-slate-800 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all placeholder-slate-400"
                    required
                    autoFocus
                    placeholder="••••••••"
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center animate-pulse">
                    {error}
                  </div>
                )}
              </div>
              <div className="flex justify-end items-center pt-8 gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-dark hover:shadow-brand-primary/50 transition-all transform active:scale-95"
                >
                  Ingresar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginScreen;
