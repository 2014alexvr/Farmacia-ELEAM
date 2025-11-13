import React, { useState } from 'react';
import { UserRole, PermissionLevel } from '../types';
import { USER_CREDENTIALS } from '../constants';
import PillIcon from './icons/PillIcon';
import CloseIcon from './icons/CloseIcon';

interface LoginScreenProps {
  onLogin: (user: { role: UserRole; permissions: PermissionLevel }) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const roles = Object.values(UserRole);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    setPassword('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    const credentials = USER_CREDENTIALS[selectedRole];
    if (credentials && credentials.password === password) {
      onLogin({ role: selectedRole, permissions: credentials.permissions });
    } else {
      setError('Contraseña incorrecta. Por favor, intente de nuevo.');
    }
  };

  const closeModal = () => {
    setSelectedRole(null);
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <PillIcon className="w-16 h-16 text-brand-primary" />
            </div>
            <h1 className="text-4xl font-bold text-brand-dark">FARMACIA ELEAM</h1>
            <p className="mt-2 text-lg text-gray-600">Gestión de Medicamentos</p>
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
                <div>
                  <label htmlFor="password" className="sr-only">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
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