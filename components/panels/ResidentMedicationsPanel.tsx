import React, { useState } from 'react';
import { Resident, ResidentMedication, User } from '../../types';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import AddMedicationModal from './AddMedicationModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface ResidentMedicationsPanelProps {
  user: User;
  resident: Resident;
  onBack: () => void;
  medications: ResidentMedication[];
  onSaveMedication: (medicationData: Omit<ResidentMedication, 'id' | 'residentId'> | ResidentMedication) => void;
  onDeleteMedication: (medicationId: string) => void;
}

const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const ResidentMedicationsPanel: React.FC<ResidentMedicationsPanelProps> = ({ user, resident, onBack, medications, onSaveMedication, onDeleteMedication }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState<ResidentMedication | null>(null);
  const [medicationToDelete, setMedicationToDelete] = useState<ResidentMedication | null>(null);
  const age = calculateAge(resident.dateOfBirth);

  const canAdd = user.permissions === 'Total' || user.permissions === 'Modificar';
  const canModify = user.permissions === 'Total' || user.permissions === 'Modificar';
  const canDelete = user.permissions === 'Total';

  const handleSave = (medicationData: Omit<ResidentMedication, 'id' | 'residentId'> | ResidentMedication) => {
    onSaveMedication(medicationData);
    setIsModalOpen(false);
    setMedicationToEdit(null);
  }

  const handleOpenModalForAdd = () => {
    setMedicationToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (medication: ResidentMedication) => {
    if (canModify) {
      setMedicationToEdit(medication);
      setIsModalOpen(true);
    }
  };
  
  const confirmDeletion = () => {
    if (medicationToDelete) {
      onDeleteMedication(medicationToDelete.id);
      setMedicationToDelete(null);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center text-brand-secondary font-semibold mb-4 hover:underline">
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver al listado
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">{`Medicamentos de ${resident.name}`}</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Residente</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-700">
          <div>
            <p className="text-sm text-gray-500">Nombre Completo</p>
            <p className="font-semibold">{resident.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">RUT</p>
            <p className="font-semibold">{resident.rut}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
            <p className="font-semibold">{new Date(resident.dateOfBirth).toLocaleDateString('es-CL')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Edad Actual</p>
            <p className="font-semibold">{age} años</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Listado de Medicamentos</h2>
            {canAdd && (
              <button onClick={handleOpenModalForAdd} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors">
                  + Agregar Medicamento
              </button>
            )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Nombre del Medicamento</th>
                <th className="p-4 font-semibold text-gray-600">Dosis</th>
                <th className="p-4 font-semibold text-gray-600">Horarios</th>
                <th className="p-4 font-semibold text-gray-600">Posología</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Gasto Diario</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Existencias</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Días de Stock</th>
                <th className="p-4 font-semibold text-gray-600">Procedencia</th>
                <th className="p-4 font-semibold text-gray-600">Fecha Entrega</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {medications.length > 0 ? (
                medications.map((med, index) => {
                  const dailyExpense = med.schedules.reduce((sum, s) => sum + s.quantity, 0);
                  const stockDays = dailyExpense > 0 ? Math.floor(med.stock / dailyExpense) : 'N/A';
                  
                  return (
                    <tr key={med.id} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="p-4 font-medium text-gray-800">
                        <button
                          onClick={() => handleOpenModalForEdit(med)}
                          disabled={!canModify}
                          className={`text-left ${canModify ? 'hover:underline cursor-pointer' : 'cursor-default'}`}
                        >
                          {med.medicationName}
                        </button>
                      </td>
                      <td className="p-4 text-gray-800">{`${med.doseValue} ${med.doseUnit}`}</td>
                      <td className="p-4 text-gray-800">{med.schedules.map(s => s.time).filter(Boolean).join(', ')}</td>
                      <td className="p-4 text-gray-800">{med.schedules.map(s => `${s.quantity} ${s.unit}`).join(' / ')}</td>
                      <td className="p-4 text-center text-gray-800">{dailyExpense}</td>
                      <td className="p-4 text-center text-gray-800">{`${med.stock} ${med.stockUnit}`}</td>
                      <td className="p-4 text-center font-bold text-gray-800">{stockDays}</td>
                      <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              med.provenance === 'Cesfam' ? 'bg-blue-100 text-blue-800' :
                              med.provenance === 'Compras' ? 'bg-green-100 text-green-800' :
                              med.provenance === 'Donación' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                              {med.provenance}
                          </span>
                      </td>
                      <td className="p-4 text-gray-800">
                        {med.deliveryDate ? new Date(med.deliveryDate).toLocaleDateString('es-CL', { timeZone: 'UTC' }) : 'N/A'}
                      </td>
                      <td className="p-4 text-center">
                        {canDelete && (
                          <button 
                            onClick={() => setMedicationToDelete(med)}
                            className="font-semibold text-red-500 hover:text-red-700 transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center p-8 text-gray-500">
                    Este residente no tiene medicamentos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        {isModalOpen && (
            <AddMedicationModal 
                onClose={() => { setIsModalOpen(false); setMedicationToEdit(null); }}
                onSave={handleSave}
                medicationToEdit={medicationToEdit || undefined}
            />
        )}
        {medicationToDelete && (
            <ConfirmDeleteModal
                itemName={medicationToDelete.medicationName}
                onConfirm={confirmDeletion}
                onCancel={() => setMedicationToDelete(null)}
            />
        )}
    </div>
  );
};

export default ResidentMedicationsPanel;