
import React, { useState } from 'react';
import { User, ManagedUser } from '../../types';
import UserModal from './UserModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface AdminAppPanelProps {
  currentUser: User;
  users: ManagedUser[];
  onSaveUser: (userData: Omit<ManagedUser, 'id'> | ManagedUser) => void;
  onDeleteUser: (userId: string) => void;
}

const AdminAppPanel: React.FC<AdminAppPanelProps> = ({ currentUser, users, onSaveUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<ManagedUser | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);

  const handleOpenModalForAdd = () => {
    setUserToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (user: ManagedUser) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleSave = (userData: Omit<ManagedUser, 'id'> | ManagedUser) => {
    onSaveUser(userData);
    setIsModalOpen(false);
  };
  
  const confirmDeletion = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };
  
  const currentUserName = currentUser.name;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Administración de Usuarios</h1>
        <button
          onClick={handleOpenModalForAdd}
          className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-dark transition-colors"
        >
          + Crear Usuario Nuevo
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Nombre</th>
                <th className="p-4 font-semibold text-gray-600">Permisos</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-4 font-medium text-black">{user.name}</td>
                  <td className="p-4 text-gray-700">
                    {user.permissions === 'Solo Lectura' ? 'Sólo Lectura' : user.permissions}
                  </td>
                  <td className="p-4 text-center space-x-4">
                    <button onClick={() => handleOpenModalForEdit(user)} className="font-semibold text-brand-secondary hover:underline">Modificar</button>
                    <button 
                      onClick={() => setUserToDelete(user)} 
                      className="font-semibold text-red-500 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
                      disabled={user.name === currentUserName}
                      title={user.name === currentUserName ? "No puede eliminar su propio usuario" : "Eliminar usuario"}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <UserModal 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          userToEdit={userToEdit}
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
