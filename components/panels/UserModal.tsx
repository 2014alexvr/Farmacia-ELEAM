import React, { useState, useEffect } from 'react';
import { ManagedUser, UserRole } from '../../types';
import { ROLE_PERMISSIONS } from '../../constants';
import CloseIcon from '../icons/CloseIcon';

interface UserModalProps {
  onClose: () => void;
  onSave: (user: Omit<ManagedUser, 'id'> | ManagedUser) => void;
  userToEdit?: ManagedUser;
}

const UserModal: React.FC<UserModalProps> = ({ onClose, onSave, userToEdit }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Visitor);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isEditing = !!userToEdit;

  useEffect(() => {
    if (isEditing && userToEdit) {
      setName(userToEdit.name);
      setRole(userToEdit.role);
    }
  }, [isEditing, userToEdit]);

  const isFormValid = name.trim() !== '' && (password === confirmPassword) && (!isEditing || password.length === 0 || password.length >= 6) && (isEditing || password.length >= 6);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setPasswordError('Las contraseñas no coinciden.');
        return;
    }
    if (!isEditing && password.length < 6) {
        setPasswordError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    if (isEditing && password.length > 0 && password.length < 6) {
        setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
    }
    
    setPasswordError('');
    if (!isFormValid) return;

    const permissions = ROLE_PERMISSIONS[role];
    
    let userData: Partial<ManagedUser> & { name: string; role: UserRole; permissions: string } = {
      name,
      role,
      permissions,
    };
    
    if (isEditing && userToEdit) {
      const finalUserData: ManagedUser = {
          ...userToEdit,
          name,
          role,
          permissions,
          password: password ? password : userToEdit.password,
      };
      onSave(finalUserData);
    } else {
      userData.password = password;
      onSave(userData as Omit<ManagedUser, 'id'>);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative animate-fade-in-down">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Modificar Usuario' : 'Crear Nuevo Usuario'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rol</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
              >
                {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                placeholder={isEditing ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'}
                required={!isEditing}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                required={!isEditing || password.length > 0}
              />
            </div>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          </div>
          <div className="flex justify-end items-center p-6 border-t bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mr-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;