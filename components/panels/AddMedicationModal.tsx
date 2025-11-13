import React, { useState, useMemo, useEffect } from 'react';
import { ResidentMedication, Provenance, MedicationSchedule } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface AddMedicationModalProps {
  onClose: () => void;
  onSave: (medication: Omit<ResidentMedication, 'id' | 'residentId'> | ResidentMedication) => void;
  medicationToEdit?: ResidentMedication;
}

const DOSE_UNITS = ['Mg', 'Gr', 'Mg/ml', 'NPH', '%', ''];
const POSOLOGY_UNITS = ['Comp', 'Gotas', 'Puff', 'UI', 'CC', ''];
const PROVENANCE_OPTIONS: Provenance[] = ['Cesfam', 'Salud Mental', 'Hospital', 'CAE Quilpué', 'CAE Viña', 'Familia', 'Compras', 'Donación'];

const AddMedicationModal: React.FC<AddMedicationModalProps> = ({ onClose, onSave, medicationToEdit }) => {
  const [medicationName, setMedicationName] = useState('');
  const [doseValue, setDoseValue] = useState('');
  const [doseUnit, setDoseUnit] = useState('Mg');
  
  const [schedules, setSchedules] = useState([
    { time: '', quantity: '', unit: 'Comp' },
    { time: '', quantity: '', unit: 'Comp' },
    { time: '', quantity: '', unit: 'Comp' },
    { time: '', quantity: '', unit: 'Comp' },
  ]);

  const [stock, setStock] = useState('');
  const [stockUnit, setStockUnit] = useState('Comp');
  const [provenance, setProvenance] = useState<Provenance>('Cesfam');
  const [deliveryDate, setDeliveryDate] = useState('');

  const isEditing = !!medicationToEdit;

  useEffect(() => {
    if (isEditing && medicationToEdit) {
      setMedicationName(medicationToEdit.medicationName);
      setDoseValue(String(medicationToEdit.doseValue));
      setDoseUnit(medicationToEdit.doseUnit);
      
      const initialSchedules = [...schedules];
      medicationToEdit.schedules.forEach((s, i) => {
        if (initialSchedules[i]) {
          initialSchedules[i] = { time: s.time, quantity: String(s.quantity), unit: s.unit };
        }
      });
      setSchedules(initialSchedules);

      setStock(String(medicationToEdit.stock));
      setStockUnit(medicationToEdit.stockUnit);
      setProvenance(medicationToEdit.provenance);
      setDeliveryDate(medicationToEdit.deliveryDate || '');
    }
  }, [isEditing, medicationToEdit]);


  const handleScheduleChange = (index: number, field: 'time' | 'quantity' | 'unit', value: string) => {
    const newSchedules = [...schedules];
    newSchedules[index][field] = value;
    setSchedules(newSchedules);
  };

  const dailyExpense = useMemo(() => {
    return schedules.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
  }, [schedules]);

  const stockDays = useMemo(() => {
    const stockValue = Number(stock) || 0;
    if (dailyExpense === 0 || stockValue === 0) return 0;
    return Math.floor(stockValue / dailyExpense);
  }, [stock, dailyExpense]);
  
  const isFormValid = medicationName.trim() !== '' && doseValue.trim() !== '' && dailyExpense > 0 && (Number(stock) || 0) > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const finalSchedules: MedicationSchedule[] = schedules
        .filter(s => s.time && Number(s.quantity) > 0)
        .map(s => ({ ...s, quantity: Number(s.quantity) }));

    const medicationPayload = {
      medicationName,
      doseValue,
      doseUnit,
      schedules: finalSchedules,
      stock: Number(stock),
      stockUnit,
      provenance,
      deliveryDate: deliveryDate || undefined, // Send undefined if empty
    };
    
    if(isEditing && medicationToEdit) {
        onSave({ ...medicationToEdit, ...medicationPayload });
    } else {
        onSave(medicationPayload);
    }
  };

  const inputStyle = "mt-1 w-full border-gray-600 rounded-md shadow-sm bg-brand-dark text-white placeholder-gray-400 focus:ring-brand-secondary focus:border-brand-secondary";
  const leftInputStyle = "mt-1 w-full border-gray-600 rounded-l-md shadow-sm bg-brand-dark text-white placeholder-gray-400 focus:ring-brand-secondary focus:border-brand-secondary";
  const rightSelectStyle = "mt-1 border-gray-600 border-l-0 rounded-r-md shadow-sm bg-brand-dark text-white focus:ring-brand-secondary focus:border-brand-secondary";

  const disabledInputStyle = "mt-1 w-full border-gray-700 rounded-md shadow-sm bg-brand-dark/70 text-gray-400 cursor-not-allowed";
  const disabledLeftInputStyle = "mt-1 w-full border-gray-700 rounded-l-md shadow-sm bg-brand-dark/70 text-gray-400 cursor-not-allowed";
  const disabledRightSelectStyle = "mt-1 border-gray-700 border-l-0 rounded-r-md shadow-sm bg-brand-dark/70 text-gray-400 cursor-not-allowed";


  const renderScheduleInputs = () => {
    return schedules.map((s, index) => (
      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
        <div>
            <label className="block text-xs font-medium text-gray-600">Horario {index + 1}</label>
            <input type="time" value={s.time} onChange={e => handleScheduleChange(index, 'time', e.target.value)} className={`${inputStyle} text-sm`} />
        </div>
        <div>
            <label className="block text-xs font-medium text-gray-600">Posología {index + 1}</label>
            <div className="flex">
                <input type="number" placeholder="Cant." value={s.quantity} onChange={e => handleScheduleChange(index, 'quantity', e.target.value)} className={`${leftInputStyle} text-sm`} />
                <select value={s.unit} onChange={e => handleScheduleChange(index, 'unit', e.target.value)} className={`${rightSelectStyle} text-sm`}>
                    {POSOLOGY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </div>
        </div>
      </div>
    ));
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in-down my-8">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Modificar Medicamento' : 'Agregar Medicamento'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            
            {/* Nombre y Dosis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del medicamento</label>
                <input type="text" value={medicationName} onChange={e => setMedicationName(e.target.value)} className={inputStyle} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dosis</label>
                <div className="flex">
                    <input type="text" placeholder="Valor" value={doseValue} onChange={e => setDoseValue(e.target.value)} className={leftInputStyle} required />
                    <select value={doseUnit} onChange={e => setDoseUnit(e.target.value)} className={rightSelectStyle}>
                       {DOSE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
              </div>
            </div>
            
            <hr/>
            
            {/* Horarios y Posologías */}
            <div className="space-y-3">{renderScheduleInputs()}</div>
            
            <hr/>

            {/* Gasto, Existencias y Días */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Gasto Diario</label>
                    <div className="flex">
                        <input type="text" value={dailyExpense} className={disabledLeftInputStyle} disabled />
                         <select value={schedules.find(s=>s.quantity)?.unit || 'Comp'} className={disabledRightSelectStyle} disabled>
                           {POSOLOGY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Existencias</label>
                    <div className="flex">
                        <input type="number" placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)} className={leftInputStyle} required/>
                        <select value={stockUnit} onChange={e => setStockUnit(e.target.value)} className={rightSelectStyle}>
                           {POSOLOGY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Días con stock</label>
                    <input type="text" value={`${stockDays} días`} className={disabledInputStyle} disabled />
                </div>
            </div>
            
            {/* Procedencia y Fecha Entrega */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Procedencia</label>
                <select value={provenance} onChange={e => setProvenance(e.target.value as Provenance)} className={inputStyle}>
                  {PROVENANCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Fecha Entrega</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="date" 
                    value={deliveryDate} 
                    onChange={e => setDeliveryDate(e.target.value)} 
                    className={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setDeliveryDate('')}
                    className="mt-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                    title="Limpiar fecha"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            </div>


          </div>
          <div className="flex justify-end items-center p-5 border-t bg-gray-50">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-3">Cancelar</button>
            <button type="submit" disabled={!isFormValid} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark disabled:bg-gray-400">{isEditing ? 'Guardar Cambios' : 'Guardar Medicamento'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicationModal;