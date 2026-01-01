import React, { useState, useEffect } from 'react';
import { GeneralMedication, Provenance } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import PillIcon from '../icons/PillIcon';

interface AddGeneralKitModalProps {
  onClose: () => void;
  onSave: (item: Omit<GeneralMedication, 'id'> | GeneralMedication) => void;
  itemToEdit?: GeneralMedication;
}

const DOSE_UNITS = ['Mcg', 'Mg', 'Gr', 'Ml', 'Mg/ml', 'NPH', '%', ''];
const PROVENANCE_OPTIONS: Provenance[] = ['Cesfam', 'Salud Mental', 'Hospital', 'CAE Quilpué', 'CAE Viña', 'Familia', 'Compras', 'Donación'];

const AddGeneralKitModal: React.FC<AddGeneralKitModalProps> = ({ onClose, onSave, itemToEdit }) => {
  const [nombreMedicamento, setNombreMedicamento] = useState('');
  
  // Split format into value and unit
  const [doseValue, setDoseValue] = useState('');
  const [doseUnit, setDoseUnit] = useState('Mg');

  const [cantidadTotal, setCantidadTotal] = useState('');
  const [procedencia, setProcedencia] = useState<string>('Compras');
  const [fechaAdquisicion, setFechaAdquisicion] = useState(new Date().toISOString().split('T')[0]);

  const isEditing = !!itemToEdit;

  useEffect(() => {
    if (isEditing && itemToEdit) {
      setNombreMedicamento(itemToEdit.nombre_medicamento);
      
      // Parse Formato (Expected format: "Value Unit" or just "Unit")
      const fmt = itemToEdit.formato || '';
      const parts = fmt.split(' ');
      
      // Basic check if the last part is a unit (case-insensitive check)
      const possibleUnit = parts.length > 1 ? parts[parts.length - 1] : fmt;
      const matchedUnit = DOSE_UNITS.find(u => u.toLowerCase() === possibleUnit.toLowerCase());
      
      if (parts.length > 1 && matchedUnit !== undefined) {
          setDoseValue(parts.slice(0, -1).join(' ')); // Join rest as value
          setDoseUnit(matchedUnit || possibleUnit);
      } else if (matchedUnit !== undefined) {
          setDoseValue('');
          setDoseUnit(matchedUnit);
      } else {
          setDoseValue(fmt);
          setDoseUnit('');
      }

      setCantidadTotal(String(itemToEdit.cantidad_total));
      setProcedencia(itemToEdit.procedencia || 'Compras');
      if (itemToEdit.fecha_adquisicion) {
          setFechaAdquisicion(itemToEdit.fecha_adquisicion.split('T')[0]);
      }
    }
  }, [isEditing, itemToEdit]);

  const isFormValid = nombreMedicamento.trim() !== '' && cantidadTotal.trim() !== '' && (doseValue.trim() !== '' || doseUnit.trim() !== '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Combine value and unit for storage
    const fullFormat = doseUnit ? `${doseValue} ${doseUnit}`.trim() : doseValue.trim();

    const newItem = {
      nombre_medicamento: nombreMedicamento.trim(),
      formato: fullFormat,
      cantidad_total: parseFloat(cantidadTotal),
      procedencia: procedencia,
      fecha_adquisicion: fechaAdquisicion,
    };

    if (isEditing && itemToEdit) {
      onSave({ ...itemToEdit, ...newItem });
    } else {
      onSave(newItem);
    }
  };

  // Estilos modernos (Dark Inputs)
  const labelStyle = "block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1";
  const inputBase = "block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white font-semibold focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all placeholder-slate-400 shadow-inner text-sm";
  const inputRounded = `${inputBase} rounded-2xl`;
  const inputLeft = `${inputBase} rounded-l-2xl border-r-0`;
  const inputRight = `${inputBase} rounded-r-2xl border-l-0 bg-slate-700`;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex justify-center items-center p-4 transition-all">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg relative animate-scale-in overflow-hidden border border-white/20 ring-1 ring-black/10">
        
        {/* Header Decorativo */}
        <div className="h-4 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary w-full shrink-0" />

        {/* Título y Cierre */}
        <div className="flex justify-between items-start px-8 pt-8 pb-4 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-light rounded-2xl text-brand-primary shadow-sm hidden sm:block border border-brand-secondary/20">
                <PillIcon className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {isEditing ? 'Editar Ítem' : 'Nuevo Ítem'}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Botiquín General</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            
            {/* Nombre */}
            <div>
                <label className={labelStyle}>Nombre del Medicamento / Insumo *</label>
                <input 
                    type="text" 
                    value={nombreMedicamento} 
                    onChange={e => setNombreMedicamento(e.target.value)} 
                    className={inputRounded}
                    placeholder="Ej: Paracetamol, Gasas, etc."
                    required 
                    autoFocus
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Dosis / Concentración (Nuevo Formato) */}
                <div>
                    <label className={labelStyle}>Dosis / Concentración *</label>
                    <div className="flex shadow-sm rounded-2xl overflow-hidden">
                        <input 
                            type="text" 
                            placeholder="0" 
                            value={doseValue} 
                            onChange={e => setDoseValue(e.target.value)} 
                            className={inputLeft} 
                            required
                        />
                        <select 
                            value={doseUnit} 
                            onChange={e => setDoseUnit(e.target.value)} 
                            className={`${inputRight} w-24 text-center text-xs border-l border-slate-600`}
                        >
                            {DOSE_UNITS.map(u => <option key={u} value={u}>{u || 'N/A'}</option>)}
                        </select>
                    </div>
                </div>

                {/* Cantidad Total */}
                <div>
                    <label className={labelStyle}>Cantidad Total *</label>
                    <input 
                        type="number" 
                        step="any"
                        value={cantidadTotal} 
                        onChange={e => setCantidadTotal(e.target.value)} 
                        className={inputRounded}
                        placeholder="0"
                        required 
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Procedencia */}
                <div>
                    <label className={labelStyle}>Procedencia</label>
                    <select value={procedencia} onChange={e => setProcedencia(e.target.value)} className={inputRounded}>
                         {PROVENANCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>

                {/* Fecha Adquisición */}
                <div>
                    <label className={labelStyle}>Fecha Adquisición</label>
                    <input 
                        type="date" 
                        value={fechaAdquisicion} 
                        onChange={e => setFechaAdquisicion(e.target.value)} 
                        className={inputRounded}
                        style={{ colorScheme: 'dark' }}
                    />
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={!isFormValid}
                    className="flex-1 py-3 bg-gradient-to-r from-brand-secondary to-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isEditing ? 'Guardar Cambios' : 'Crear Ítem'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddGeneralKitModal;