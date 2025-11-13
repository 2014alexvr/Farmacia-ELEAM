import React, { useState, useMemo, useEffect } from 'react';
import { Resident } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface AddResidentModalProps {
  onClose: () => void;
  onSave: (resident: Omit<Resident, 'id'> | Resident) => void;
  residentToEdit?: Resident;
}

const AddResidentModal: React.FC<AddResidentModalProps> = ({ onClose, onSave, residentToEdit }) => {
  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  const isEditing = !!residentToEdit;

  useEffect(() => {
    if (isEditing) {
      setName(residentToEdit.name);
      setRut(residentToEdit.rut);
      setDateOfBirth(residentToEdit.dateOfBirth);
    }
  }, [isEditing, residentToEdit]);

  const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime()) || birthDate > new Date()) return null;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = useMemo(() => calculateAge(dateOfBirth), [dateOfBirth]);
  
  const isFormValid = name.trim() !== '' && rut.trim() !== '' && dateOfBirth.trim() !== '' && age !== null && age >= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    const residentData = {
        name,
        rut,
        dateOfBirth,
    };
    
    if(isEditing) {
        onSave({ ...residentToEdit, ...residentData });
    } else {
        onSave(residentData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative animate-fade-in-down">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Modificar Residente' : 'Agregar Nuevo Residente'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
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
              <label htmlFor="rut" className="block text-sm font-medium text-gray-700">RUT</label>
              <input
                type="text"
                id="rut"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                required
                placeholder="Ej: 12.345.678-9"
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
              <input
                type="date"
                id="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                required
              />
            </div>
             <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">Edad Actual</label>
              <input
                type="text"
                id="age"
                value={age !== null ? `${age} años` : ''}
                placeholder="La edad se calculará automáticamente"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                disabled
              />
            </div>
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
              {isEditing ? 'Guardar Cambios' : 'Guardar Residente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResidentModal;
