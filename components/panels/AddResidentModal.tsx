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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative animate-scale-in overflow-hidden border border-white/20 ring-1 ring-black/5">
        
        {/* Borde Superior Decorativo */}
        <div className="h-3 bg-gradient-to-r from-brand-primary to-brand-secondary w-full" />

        <div className="flex justify-between items-center px-8 pt-8 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {isEditing ? 'Modificar Residente' : 'Agregar Nuevo Residente'}
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Complete la ficha personal</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-brand-primary hover:bg-brand-light transition-all"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Nombre Completo
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white font-medium focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all placeholder-slate-400 shadow-sm"
                placeholder="Ej: Juan Pérez González"
                required
              />
            </div>
            
            <div>
              <label htmlFor="rut" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                RUT
              </label>
              <input
                type="text"
                id="rut"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                className="block w-full px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white font-medium focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all placeholder-slate-400 shadow-sm"
                required
                placeholder="Ej: 12.345.678-9"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="dateOfBirth" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="block w-full px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white font-medium focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all shadow-sm"
                  style={{ colorScheme: 'dark' }}
                  required
                />
              </div>
               <div>
                <label htmlFor="age" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Edad Actual
                </label>
                <input
                  type="text"
                  id="age"
                  value={age !== null ? `${age} años` : ''}
                  placeholder="Calculando..."
                  className="block w-full px-4 py-3.5 bg-slate-800 border border-transparent rounded-xl text-slate-300 font-bold shadow-inner cursor-not-allowed"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-600 font-bold rounded-xl hover:bg-white hover:shadow-sm transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              {isEditing ? 'Guardar Cambios' : 'Guardar Residente'}
            </button>
          </div>
          
          {/* Borde Inferior Decorativo */}
          <div className="h-2 bg-gradient-to-r from-brand-secondary to-brand-primary w-full" />
        </form>
      </div>
    </div>
  );
};

export default AddResidentModal;