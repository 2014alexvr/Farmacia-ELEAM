
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <PillIcon className="w-16 h-16 text-brand-primary" />
            </div>
            <h1 className="text-4xl font-bold text-brand-dark">FARMACIA ELEAM</h1>
            <p className="mt-2 text-lg text-gray-600">Sistema de Gestión de Medicamentos</p>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-700">Seleccione su Perfil para Ingresar</h2>
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className="w-full px-4 py-3 text-lg font-medium text-white transition-transform duration-200 transform bg-brand-primary rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-4 focus:ring-brand-secondary focus:ring-opacity-50 active:scale-95"
              >
                {role}
              </button>
            ))}
          </div>
          <p className="text-xs text-center text-gray-400 mt-8">© 2024 ELEAM Solutions. Todos los derechos reservados.</p>
        </div>
      </div>

      {selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm relative animate-fade-in-down">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Ingresar Contraseña</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="p-6">
                <p className="text-center text-gray-700 mb-4">
                  Iniciando sesión como <span className="font-bold">{selectedRole}</span>
                </p>

                <div className="mb-4">
                  <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">Usuario</label>
                  <select
                    id="user-select"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                  >
                    {usersForSelectedRole.map(user => (
                      <option key={user.id} value={user.id} className="text-black">{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña para <span className="font-semibold">{selectedUserName}</span></label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm text-black bg-gray-200"
                    required
                    autoFocus
                  />
                </div>
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
              </div>
              <div className="flex justify-end items-center p-6 border-t bg-gray-50 rounded-b-lg">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mr-3"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark transition-colors"
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
