import React, { useState, useEffect } from 'react';
import { ManagedUser, UserRole, PermissionLevel } from '../../types';
import { ROLE_PERMISSIONS } from '../../constants';
import CloseIcon from '../icons/CloseIcon';

interface UserModalProps {
  onClose: () => void;
  onSave: (user: Omit<ManagedUser, 'id'> | ManagedUser) => void;
  userToEdit?: ManagedUser;
  isLoading?: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ onClose, onSave, userToEdit, isLoading = false }) => {
  const [name, setName] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<PermissionLevel>('Solo Lectura');
  const [selectedStyle, setSelectedStyle] = useState<UserRole>(UserRole.Director); // Default Azul
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isEditing = !!userToEdit;

  const permissionOptions: PermissionLevel[] = ['Total', 'Modificar', 'Solo Lectura'];
  
  const styleOptions = [
      { value: UserRole.Admin, label: 'Gris (Administrativo)' },
      { value: UserRole.Tens, label: 'Verde (Clínico)' },
      { value: UserRole.Director, label: 'Azul (Técnico)' },
      { value: UserRole.Visitor, label: 'Ámbar (Visita)' },
  ];

  useEffect(() => {
    if (isEditing && userToEdit) {
      setName(userToEdit.name);
      setSelectedStyle(userToEdit.role);
      setSelectedPermission(userToEdit.permissions);
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

    // Use explicit style and permission selections
    let userData: Partial<ManagedUser> & { name: string; role: UserRole; permissions: PermissionLevel } = {
      name,
      role: selectedStyle,
      permissions: selectedPermission,
    };
    
    if (isEditing && userToEdit) {
      const finalUserData: ManagedUser = {
          ...userToEdit,
          name,
          role: selectedStyle,
          permissions: selectedPermission,
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
          <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <fieldset disabled={isLoading} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm bg-gray-600 text-white placeholder-gray-300 disabled:opacity-60"
                        required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="style" className="block text-sm font-medium text-gray-700">Estilo Visual (Icono)</label>
                        <select
                            id="style"
                            value={selectedStyle}
                            onChange={(e) => setSelectedStyle(e.target.value as UserRole)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm bg-gray-600 text-white disabled:opacity-60"
                        >
                            {styleOptions.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-gray-600 text-white">{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="permission" className="block text-sm font-medium text-gray-700">Permisos</label>
                        <select
                            id="permission"
                            value={selectedPermission}
                            onChange={(e) => setSelectedPermission(e.target.value as PermissionLevel)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm bg-gray-600 text-white disabled:opacity-60"
                        >
                            {permissionOptions.map(opt => (
                                <option key={opt} value={opt} className="bg-gray-600 text-white">{opt}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm bg-gray-600 text-white placeholder-gray-300 disabled:opacity-60"
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm bg-gray-600 text-white placeholder-gray-300 disabled:opacity-60"
                        required={!isEditing || password.length > 0}
                    />
                </div>
            </fieldset>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          </div>
          <div className="flex justify-end items-center p-6 border-t bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mr-3 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isLoading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;