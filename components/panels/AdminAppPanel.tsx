import React, { useState } from 'react';
import { User, ManagedUser, UserRole } from '../../types';
import UserModal from './UserModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import SettingsIcon from '../icons/SettingsIcon';
import HeartPulseIcon from '../icons/HeartPulseIcon';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import FamilyIcon from '../icons/FamilyIcon';
import UsersIcon from '../icons/UsersIcon';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import ChevronUpIcon from '../icons/ChevronUpIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import ChartBarIcon from '../icons/ChartBarIcon';

interface AdminAppPanelProps {
  currentUser: User;
  users: ManagedUser[];
  onSaveUser: (userData: Omit<ManagedUser, 'id'> | ManagedUser) => Promise<void>;
  onDeleteUser: (userId: string) => void;
  onReorderUsers: (users: ManagedUser[]) => Promise<void>;
  onRestoreData: () => Promise<void>;
}

const AdminAppPanel: React.FC<AdminAppPanelProps> = ({ currentUser, users, onSaveUser, onDeleteUser, onReorderUsers, onRestoreData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<ManagedUser | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Helper para obtener icono según rol
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin: return SettingsIcon;
      case UserRole.Tens: return HeartPulseIcon;
      case UserRole.Director: return DocumentTextIcon;
      case UserRole.Visitor: return FamilyIcon;
      default: return UsersIcon;
    }
  };

  // Helper para estilos de color según rol
  const getRoleStyles = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin: 
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-600',
          iconBg: 'bg-slate-200',
          gradient: 'from-slate-400 to-slate-500'
        };
      case UserRole.Tens: 
        return {
          bg: 'bg-emerald-50/50',
          border: 'border-emerald-100',
          text: 'text-emerald-700',
          iconBg: 'bg-emerald-100',
          gradient: 'from-emerald-400 to-emerald-500'
        };
      case UserRole.Director: 
        return {
          bg: 'bg-blue-50/50',
          border: 'border-blue-100',
          text: 'text-blue-700',
          iconBg: 'bg-blue-100',
          gradient: 'from-blue-400 to-blue-500'
        };
      case UserRole.Visitor: 
        return {
          bg: 'bg-amber-50/50',
          border: 'border-amber-100',
          text: 'text-amber-700',
          iconBg: 'bg-amber-100',
          gradient: 'from-amber-400 to-amber-500'
        };
      default: 
        return {
          bg: 'bg-white',
          border: 'border-slate-100',
          text: 'text-slate-600',
          iconBg: 'bg-slate-100',
          gradient: 'from-slate-300 to-slate-400'
        };
    }
  };

  const handleOpenModalForAdd = () => {
    setUserToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (user: ManagedUser) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleSave = async (userData: Omit<ManagedUser, 'id'> | ManagedUser) => {
    setIsSaving(true);
    try {
      await onSaveUser(userData);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving user", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const confirmDeletion = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  const moveUser = async (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === users.length - 1) return;

      const newUsers = [...users];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Swap elements
      const temp = newUsers[index];
      newUsers[index] = newUsers[targetIndex];
      newUsers[targetIndex] = temp;

      // Update displayOrder property for all (to be safe and consistent)
      const updatedUsers = newUsers.map((u, idx) => ({ ...u, displayOrder: idx }));

      await onReorderUsers(updatedUsers);
  };
  
  const currentUserName = currentUser.name;

  return (
    <div className="animate-fade-in-down pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Administración de Usuarios</h1>
            <p className="text-slate-500 mt-1 font-medium">Gestione los accesos y roles del personal.</p>
        </div>
        <button
            onClick={handleOpenModalForAdd}
            className="px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
        >
            <div className="bg-white/20 p-1 rounded-lg">
                <UsersIcon className="w-5 h-5" />
            </div>
            Crear Usuario Nuevo
        </button>
      </div>

      {/* Grid de Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {users.map((user, index) => {
            const Icon = getRoleIcon(user.role);
            const styles = getRoleStyles(user.role);
            const isCurrentUser = user.name === currentUserName;
            const isFirst = index === 0;
            const isLast = index === users.length - 1;

            return (
                <div 
                    key={user.id} 
                    className={`group bg-white rounded-3xl shadow-soft border ${styles.border} overflow-hidden hover:shadow-xl transition-all duration-300 relative`}
                >
                    {/* Barra Superior Color Role */}
                    <div className={`h-2 bg-gradient-to-r ${styles.gradient} w-full`}></div>

                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} ${styles.text} flex items-center justify-center shadow-sm border border-white`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            
                            {/* Ordering Buttons */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button 
                                    onClick={() => moveUser(index, 'up')} 
                                    disabled={isFirst}
                                    className={`p-1 rounded-md transition-colors ${isFirst ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-white hover:text-brand-primary hover:shadow-sm'}`}
                                    title="Mover arriba"
                                >
                                    <ChevronUpIcon className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => moveUser(index, 'down')} 
                                    disabled={isLast}
                                    className={`p-1 rounded-md transition-colors ${isLast ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-white hover:text-brand-primary hover:shadow-sm'}`}
                                    title="Mover abajo"
                                >
                                    <ChevronDownIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-slate-800 truncate mt-2" title={user.name}>
                                {user.name}
                            </h3>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                            <p className="text-sm font-medium text-slate-500">
                                Permiso: <span className="text-slate-700">{user.permissions === 'Solo Lectura' ? 'Sólo Lectura' : user.permissions}</span>
                            </p>
                        </div>

                        {/* Actions Footer */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                            <button 
                                onClick={() => handleOpenModalForEdit(user)} 
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-brand-primary transition-colors"
                            >
                                <PencilIcon className="w-4 h-4" />
                                Modificar
                            </button>
                            
                            <button 
                                onClick={() => setUserToDelete(user)} 
                                disabled={isCurrentUser}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                                    isCurrentUser 
                                    ? 'text-slate-300 cursor-not-allowed' 
                                    : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                                }`}
                                title={isCurrentUser ? "No puede eliminar su propio usuario" : "Eliminar usuario"}
                            >
                                <TrashIcon className="w-4 h-4" />
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
      
      {users.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 mb-12">
              <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-500">No hay usuarios registrados.</p>
          </div>
      )}

      {isModalOpen && (
        <UserModal 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          userToEdit={userToEdit}
          isLoading={isSaving}
        />
      )}
      
      {userToDelete && (
        <ConfirmDeleteModal
          itemName={userToDelete.name}
          onConfirm={confirmDeletion}
          onCancel={() => setUserToDelete(null)}
        />
      )}
    </div>
  );
};

export default AdminAppPanel;