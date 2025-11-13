import React, { useState } from 'react';
import { User, Resident } from '../../types';
import AddResidentModal from './AddResidentModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface ResidentsPanelProps {
  user: User;
  onSelectResident: (resident: Resident) => void;
  residents: Resident[];
  onSaveResident: (residentData: Omit<Resident, 'id'> | Resident) => void;
  onDeleteResident: (residentId: number) => void;
}

const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const [year, month, day] = dob.split('-').map(Number);
    const birthDate = new Date(Date.UTC(year, month - 1, day));
    const today = new Date();
    let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
    const m = today.getUTCMonth() - birthDate.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
        age--;
    }
    return age;
};

const formatDate = (dateString: string) => {
    if (!dateString || !dateString.includes('-')) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
};

export const ResidentsPanel: React.FC<ResidentsPanelProps> = ({ user, onSelectResident, residents, onSaveResident, onDeleteResident }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [residentToEdit, setResidentToEdit] = useState<Resident | undefined>(undefined);
  const [residentToDelete, setResidentToDelete] = useState<Resident | null>(null);

  const canAddOrDelete = user.permissions === 'Total';
  const canModify = user.permissions === 'Total' || user.permissions === 'Modificar';

  const handleOpenModalForAdd = () => {
    setResidentToEdit(undefined);
    setIsAddModalOpen(true);
  };

  const handleOpenModalForEdit = (resident: Resident, e: React.MouseEvent) => {
    e.stopPropagation();
    setResidentToEdit(resident);
    setIsAddModalOpen(true);
  };

  const handleSave = (residentData: Omit<Resident, 'id'> | Resident) => {
    onSaveResident(residentData);
    setIsAddModalOpen(false);
  };

  const handleDeleteClick = (resident: Resident, e: React.MouseEvent) => {
    e.stopPropagation();
    setResidentToDelete(resident);
  };

  const confirmDeletion = () => {
    if (residentToDelete) {
      onDeleteResident(residentToDelete.id);
      setResidentToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Residentes</h1>
        {canAddOrDelete && (
          <button
            onClick={handleOpenModalForAdd}
            className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-75"
          >
            + Agregar Residente
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {residents.map((resident) => {
          const age = calculateAge(resident.dateOfBirth);
          return (
            <div
              key={resident.id}
              className="bg-brand-primary text-white rounded-2xl shadow-xl flex flex-col w-full transform hover:scale-105 transition-transform duration-300 overflow-hidden"
            >
              <div
                onClick={() => onSelectResident(resident)}
                className="flex-grow p-5 flex flex-col items-start justify-center cursor-pointer"
              >
                <p className="font-bold text-xl leading-tight">{resident.name}</p>
                <p className="mt-2 text-base text-gray-200">
                  <span className="font-semibold">Rut:</span> {resident.rut}
                </p>
                 <p className="text-base text-gray-200">
                  <span className="font-semibold">F. Nac:</span> {formatDate(resident.dateOfBirth)}
                </p>
                 <p className="text-base text-gray-200">
                  <span className="font-semibold">Edad:</span> {age} años
                </p>
              </div>
              
              {canModify && (
                <>
                  <div className="border-t border-blue-400/50 mx-5"></div>
                  <div className="p-3 flex justify-end items-center gap-4">
                      <button onClick={(e) => handleOpenModalForEdit(resident, e)} className="font-semibold text-yellow-300 hover:text-yellow-200 transition-colors">Modificar</button>
                      {canAddOrDelete && <button onClick={(e) => handleDeleteClick(resident, e)} className="font-semibold text-red-400 hover:text-red-300 transition-colors">Eliminar</button>}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {isAddModalOpen && (
        <AddResidentModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSave}
          residentToEdit={residentToEdit}
        />
      )}

      {residentToDelete && (
        <ConfirmDeleteModal
          itemName={residentToDelete.name}
          onConfirm={confirmDeletion}
          onCancel={() => setResidentToDelete(null)}
        />
      )}
    </div>
  );
};