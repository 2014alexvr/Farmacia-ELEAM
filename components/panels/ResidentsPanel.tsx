
import React, { useState, useMemo } from 'react';
import { User, Resident } from '../../types';
import AddResidentModal from './AddResidentModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';

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
  const [searchTerm, setSearchTerm] = useState('');

  const canAddOrDelete = user.permissions === 'Total' || user.permissions === 'Modificar';
  const canModify = user.permissions === 'Total' || user.permissions === 'Modificar';

  const filteredResidents = useMemo(() => {
    if (!searchTerm.trim()) {
        return residents;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return residents.filter(resident =>
        resident.name.toLowerCase().includes(lowercasedTerm) ||
        resident.rut.replace(/[.-]/g, '').includes(lowercasedTerm.replace(/[.-]/g, ''))
    );
  }, [residents, searchTerm]);

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
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Residentes</h1>
            <p className="text-slate-500 mt-1 font-medium">Gestión de fichas y medicamentos.</p>
        </div>
        {canAddOrDelete && (
          <button
            onClick={handleOpenModalForAdd}
            className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-dark hover:shadow-brand-primary/50 transition-all active:scale-95"
          >
            + Agregar Residente
          </button>
        )}
      </div>

      <div className="mb-8">
        <div className="relative max-w-md">
            <input
                type="text"
                placeholder="Buscar residente por nombre o RUT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all shadow-sm placeholder-slate-400"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>
      </div>

      {filteredResidents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredResidents.map((resident) => {
            const age = calculateAge(resident.dateOfBirth);
            return (
              <div
                key={resident.id}
                className="group bg-slate-200 rounded-3xl shadow-lg shadow-slate-300/50 border border-slate-300 flex flex-col w-full transition-all duration-300 hover:shadow-2xl hover:shadow-slate-600/50 hover:-translate-y-2 hover:bg-slate-50 hover:border-brand-primary/50 overflow-hidden cursor-pointer relative"
                onClick={() => onSelectResident(resident)}
              >
                {/* Decorative Top Bar */}
                <div className="h-2 bg-gradient-to-r from-brand-primary to-brand-secondary w-full"></div>
                
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start">
                      <div>
                          <h3 className="font-bold text-2xl text-slate-800 group-hover:text-brand-primary transition-colors leading-tight mb-2">
                              {resident.name}
                          </h3>
                          <span className="inline-block px-3 py-1 bg-white text-slate-600 text-xl font-bold rounded-lg uppercase tracking-wider mb-4 shadow-sm border border-slate-200">
                              {resident.rut}
                          </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-primary font-bold shadow-sm border border-slate-200 group-hover:scale-110 transition-transform">
                          {resident.name.charAt(0)}
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:border-slate-200 transition-colors">
                          <p className="text-xs text-slate-400 font-bold uppercase">Fecha Nac.</p>
                          <p className="font-semibold text-slate-700">{formatDate(resident.dateOfBirth)}</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:border-slate-200 transition-colors">
                          <p className="text-xs text-slate-400 font-bold uppercase">Edad</p>
                          <p className="font-semibold text-slate-700">{age} años</p>
                      </div>
                  </div>
                </div>
                
                {canModify && (
                  <div className="px-6 py-4 bg-slate-300 border-t border-slate-400/30 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button 
                          onClick={(e) => handleOpenModalForEdit(resident, e)} 
                          className="p-2 text-slate-600 hover:text-brand-secondary hover:bg-white rounded-lg transition-colors"
                          title="Editar"
                      >
                          <PencilIcon className="w-5 h-5" />
                      </button>
                      {canAddOrDelete && (
                          <button 
                              onClick={(e) => handleDeleteClick(resident, e)} 
                              className="p-2 text-slate-600 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                              title="Eliminar"
                          >
                              <TrashIcon className="w-5 h-5" />
                          </button>
                      )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-lg font-medium text-slate-500 italic">No se encontraron residentes.</p>
            {searchTerm && <p className="text-sm mt-2 text-slate-400">Intente ajustar su búsqueda.</p>}
        </div>
      )}

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
