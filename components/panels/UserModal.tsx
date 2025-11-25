
import React, { useState, useEffect } from 'react';
import { ManagedUser, UserRole, PermissionLevel } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import UsersIcon from '../icons/UsersIcon';

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

  // Estilos consistentes con LoginScreenModern
  const labelStyle = "block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1";
  const inputStyle = "block w-full px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white font-medium focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all placeholder-slate-400 shadow-inner disabled:opacity-60";

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-all">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg relative animate-scale-in overflow-hidden border border-white/20 ring-1 ring-black/10">
        
        {/* Barra Superior Decorativa */}
        <div className="h-3 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary w-full shrink-0" />

        <div className="flex justify-between items-start px-8 pt-8 pb-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-light rounded-2xl text-brand-primary shadow-sm border border-brand-secondary/20">
                <UsersIcon className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                    {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Gestión de credenciales de acceso</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={isLoading} 
            className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-8 py-6 space-y-5">
            <fieldset disabled={isLoading} className="space-y-5">
                <div>
                    <label htmlFor="name" className={labelStyle}>Nombre Completo</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputStyle}
                        placeholder="Ej: Juan Pérez"
                        required
                        autoFocus
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="style" className={labelStyle}>Estilo Visual (Icono)</label>
                        <div className="relative">
                            <select
                                id="style"
                                value={selectedStyle}
                                onChange={(e) => setSelectedStyle(e.target.value as UserRole)}
                                className={`${inputStyle} appearance-none`}
                            >
                                {styleOptions.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-slate-800 text-white py-2">{opt.label}</option>
                                ))}
                            </select>
                            {/* Custom Arrow */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="permission" className={labelStyle}>Nivel de Permisos</label>
                        <div className="relative">
                            <select
                                id="permission"
                                value={selectedPermission}
                                onChange={(e) => setSelectedPermission(e.target.value as PermissionLevel)}
                                className={`${inputStyle} appearance-none`}
                            >
                                {permissionOptions.map(opt => (
                                    <option key={opt} value={opt} className="bg-slate-800 text-white py-2">{opt}</option>
                                ))}
                            </select>
                            {/* Custom Arrow */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-2 border-t border-slate-100 mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Seguridad</p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className={labelStyle}>Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputStyle}
                                placeholder={isEditing ? '•••••• (Dejar en blanco para mantener)' : 'Mínimo 6 caracteres'}
                                required={!isEditing}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className={labelStyle}>Confirmar Contraseña</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={inputStyle}
                                required={!isEditing || password.length > 0}
                                placeholder="••••••"
                            />
                        </div>
                    </div>
                </div>
            </fieldset>
            
            {passwordError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <p className="text-red-600 text-xs font-bold">{passwordError}</p>
                </div>
            )}
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-3 rounded-b-[40px]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 text-slate-500 font-bold rounded-xl hover:bg-white hover:text-slate-800 hover:shadow-sm transition-all border border-transparent hover:border-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="px-8 py-3 bg-gradient-to-r from-brand-secondary to-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 flex items-center gap-2"
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
