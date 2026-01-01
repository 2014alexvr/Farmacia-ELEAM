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
import FirstAidIcon from '../icons/FirstAidIcon';

interface AdminAppPanelProps {
  currentUser: User;
  users: ManagedUser[];
  onSaveUser: (userData: Omit<ManagedUser, 'id'> | ManagedUser) => Promise<void>;
  onDeleteUser: (userId: string) => void;
  onReorderUsers: (users: ManagedUser[]) => Promise<void>;
  onRestoreData: () => Promise<void>;
  onImportGeneralKit: () => Promise<void>;
}

const AdminAppPanel: React.FC<AdminAppPanelProps> = ({ 
  currentUser, 
  users, 
  onSaveUser, 
  onDeleteUser, 
  onReorderUsers, 
  onRestoreData,
  onImportGeneralKit
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<ManagedUser | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin: return SettingsIcon;
      case UserRole.Tens: return HeartPulseIcon;
      case UserRole.Director: return DocumentTextIcon;
      case UserRole.Visitor: return FamilyIcon;
      default: return UsersIcon;
    }
  };

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
      const temp = newUsers[index];
      newUsers[index] = newUsers[targetIndex];
      newUsers[targetIndex] = temp;
      const updatedUsers = newUsers.map((u, idx) => ({ ...u, displayOrder: idx }));
      await onReorderUsers(updatedUsers);
  };
  
  const currentUserName = currentUser.name;

  return (
    <div className="animate-fade-in-down pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Administración</h1>
            <p className="text-slate-500 mt-1 font-medium">Gestión avanzada del sistema.</p>
        </div>
        <div className="flex flex-wrap gap-3">
             <button
                onClick={onImportGeneralKit}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:border-brand-primary/50 transition-all active:scale-95 flex items-center gap-2"
            >
                <FirstAidIcon className="w-5 h-5 text-brand-primary" />
                Importar Lista Botiquín
            </button>
            <button
                onClick={handleOpenModalForAdd}
                className="px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
            >
                <UsersIcon className="w-5 h-5" />
                Nuevo Usuario
            </button>
        </div>
      </div>

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
                    <div className={`h-2 bg-gradient-to-r ${styles.gradient} w-full`}></div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} ${styles.text} flex items-center justify-center shadow-sm border border-white`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button onClick={() => moveUser(index, 'up')} disabled={isFirst} className={`p-1 rounded-md ${isFirst ? 'text-slate-300' : 'text-slate-500 hover:bg-white hover:text-brand-primary'}`}><ChevronUpIcon className="w-4 h-4" /></button>
                                <button onClick={() => moveUser(index, 'down')} disabled={isLast} className={`p-1 rounded-md ${isLast ? 'text-slate-300' : 'text-slate-500 hover:bg-white hover:text-brand-primary'}`}><ChevronDownIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 truncate mb-1">{user.name}</h3>
                        <p className="text-sm font-medium text-slate-500 mb-6">{user.permissions}</p>
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenModalForEdit(user)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-brand-primary transition-colors"><PencilIcon className="w-4 h-4" /> Modificar</button>
                            <button onClick={() => setUserToDelete(user)} disabled={isCurrentUser} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${isCurrentUser ? 'text-slate-300' : 'text-red-500 hover:bg-red-50'}`}><TrashIcon className="w-4 h-4" /> Eliminar</button>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      <div className="bg-slate-50 border border-dashed border-slate-300 p-8 rounded-[30px] flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
              <h3 className="text-lg font-bold text-slate-800">Zona de Recuperación</h3>
              <p className="text-slate-500 text-sm">Restaure la lista predeterminada de residentes si es necesario.</p>
          </div>
          <button onClick={onRestoreData} className="px-6 py-2 border border-slate-400 text-slate-600 font-bold rounded-xl hover:bg-white transition-all">Restaurar Residentes</button>
      </div>

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