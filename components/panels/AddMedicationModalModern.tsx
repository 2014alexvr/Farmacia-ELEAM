import React, { useState, useMemo, useEffect } from 'react';
import { ResidentMedication, Provenance, MedicationSchedule } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import PillIcon from '../icons/PillIcon';
import CalendarIcon from '../icons/CalendarIcon'; // Assuming you might have one, otherwise use PillIcon or similar visual

interface AddMedicationModalProps {
  onClose: () => void;
  onSave: (medication: Omit<ResidentMedication, 'id' | 'residentId'> | ResidentMedication) => void;
  medicationToEdit?: ResidentMedication;
  lowStockThreshold: number;
}

const DOSE_UNITS = ['Mcg', 'Mg', 'Gr', 'Mg/ml', 'NPH', '%', ''];
const POSOLOGY_UNITS = ['Comp', 'Gotas', 'Puff', 'UI', 'CC', ''];
const PROVENANCE_OPTIONS: Provenance[] = ['Cesfam', 'Salud Mental', 'Hospital', 'CAE Quilpué', 'CAE Viña', 'Familia', 'Compras', 'Donación'];

// Helper para obtener la fecha de hoy en formato YYYY-MM-DD (Local Time)
const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const AddMedicationModalModern: React.FC<AddMedicationModalProps> = ({ onClose, onSave, medicationToEdit, lowStockThreshold }) => {
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
  
  // INICIALIZAR CON FECHA DE HOY POR DEFECTO
  const [acquisitionDate, setAcquisitionDate] = useState(getTodayDate());
  const [acquisitionQuantity, setAcquisitionQuantity] = useState(''); 
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

      // --- LÓGICA DE CONSOLIDACIÓN DE STOCK ---
      // Calculamos cuánto stock queda REALMENTE hoy.
      const dailyExpense = medicationToEdit.schedules.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      
      const anchorDateStr = medicationToEdit.stockUpdatedAt || new Date().toISOString();
      const anchorDate = new Date(anchorDateStr);
      const today = new Date();
      
      anchorDate.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      
      const diffTime = today.getTime() - anchorDate.getTime();
      const daysElapsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      const consumed = dailyExpense * daysElapsed;
      const baseStock = medicationToEdit.stock; // Stock base original
      const calculatedVirtualStock = Math.max(0, baseStock - consumed);

      setStock(String(Number(calculatedVirtualStock.toFixed(2)))); // Mostramos el stock actual real con decimales
      
      setStockUnit(medicationToEdit.stockUnit);
      setProvenance(medicationToEdit.provenance);
      
      // Si ya tiene fecha guardada la usa, si no (o es null), usa hoy
      setAcquisitionDate(medicationToEdit.acquisitionDate || getTodayDate());
      
      setAcquisitionQuantity(''); 
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
  
  const isFormValid = medicationName.trim() !== '' && doseValue.trim() !== '' && dailyExpense > 0 && (Number(stock) || 0) >= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const finalSchedules: MedicationSchedule[] = schedules
        .filter(s => s.time && Number(s.quantity) > 0)
        .map(s => ({ ...s, quantity: Number(s.quantity) }));

    const currentVirtualStock = Number(stock);
    const quantityToAdd = acquisitionQuantity ? parseFloat(acquisitionQuantity) : 0;
    const finalStock = currentVirtualStock + quantityToAdd;

    const finalAcquisitionQuantity = quantityToAdd > 0 
        ? quantityToAdd 
        : (isEditing && medicationToEdit ? medicationToEdit.acquisitionQuantity : undefined);

    const medicationPayload = {
      medicationName,
      doseValue,
      doseUnit,
      schedules: finalSchedules,
      stock: finalStock, 
      stockUnit,
      provenance,
      acquisitionDate: acquisitionDate || undefined,
      acquisitionQuantity: finalAcquisitionQuantity,
      deliveryDate: deliveryDate || undefined,
      // SIEMPRE ACTUALIZAMOS LA FECHA A "AHORA"
      // Esto consolida el stock visible como el nuevo punto de partida.
      stockUpdatedAt: new Date().toISOString(), 
    };
    
    if(isEditing && medicationToEdit) {
        onSave({ ...medicationToEdit, ...medicationPayload });
    } else {
        onSave(medicationPayload);
    }
  };

  // --- Estilos de Diseño Moderno (Dark Inputs) ---
  const labelStyle = "block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1";
  const inputBase = "block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white font-semibold focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all placeholder-slate-400 shadow-inner text-sm";
  const inputRounded = `${inputBase} rounded-2xl`;
  const inputLeft = `${inputBase} rounded-l-2xl border-r-0`;
  const inputRight = `${inputBase} rounded-r-2xl border-l-0 bg-slate-700`;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex justify-center items-center p-4 transition-all">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl relative animate-scale-in overflow-hidden border border-white/20 ring-1 ring-black/10 flex flex-col max-h-[95vh]">
        
        {/* Header Decorativo Superior */}
        <div className="h-4 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary w-full shrink-0" />

        {/* Título y Cierre */}
        <div className="flex justify-between items-start px-8 pt-8 pb-2 shrink-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-light rounded-2xl text-brand-primary shadow-sm hidden sm:block border border-brand-secondary/20">
                <PillIcon className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {isEditing ? 'Actualizar Inventario' : 'Nuevo Medicamento'}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                    {isEditing 
                        ? 'Confirme el stock actual para reiniciar el conteo diario.' 
                        : 'Ingrese el stock inicial y la dosis diaria.'}
                </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-8 py-6 space-y-8 overflow-y-auto custom-scrollbar">
            
            {/* SECCIÓN 1: IDENTIFICACIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-1">
                    <label className={labelStyle}>Nombre del Medicamento</label>
                    <input 
                        type="text" 
                        value={medicationName} 
                        onChange={e => setMedicationName(e.target.value)} 
                        className={`${inputRounded} text-lg`} 
                        placeholder="Ej: Paracetamol"
                        required 
                        autoFocus
                    />
                </div>
                <div className="space-y-1">
                    <label className={labelStyle}>Dosis / Concentración</label>
                    <div className="flex shadow-sm rounded-2xl overflow-hidden">
                        <input 
                            type="text" 
                            placeholder="0" 
                            value={doseValue} 
                            onChange={e => setDoseValue(e.target.value)} 
                            className={inputLeft} 
                            required 
                        />
                        <select value={doseUnit} onChange={e => setDoseUnit(e.target.value)} className={`${inputRight} w-24 text-center text-xs border-l border-slate-600`}>
                            {DOSE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: ESQUEMA HORARIO */}
            <div className="bg-slate-50 p-6 rounded-[30px] border border-slate-100 shadow-inner">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">Esquema de Administración</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schedules.map((s, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-200/60 hover:border-brand-secondary/30 transition-colors">
                             <div className="flex flex-col w-1/3">
                                <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 text-center">Hora</label>
                                <input 
                                    type="time" 
                                    value={s.time} 
                                    onChange={e => handleScheduleChange(index, 'time', e.target.value)} 
                                    className="bg-slate-100 border-0 text-slate-800 text-sm font-bold rounded-xl p-2 text-center focus:ring-2 focus:ring-brand-secondary"
                                    style={{ colorScheme: 'light' }} 
                                />
                             </div>
                             <div className="flex flex-col w-2/3">
                                <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Dosis</label>
                                <div className="flex shadow-sm rounded-xl overflow-hidden">
                                    <input 
                                        type="number" 
                                        step="any"
                                        placeholder="0" 
                                        value={s.quantity} 
                                        onChange={e => handleScheduleChange(index, 'quantity', e.target.value)} 
                                        className="w-full bg-slate-700 text-white border-0 p-2 text-sm font-bold placeholder-slate-500 focus:ring-2 focus:ring-brand-secondary focus:z-10"
                                    />
                                    <select 
                                        value={s.unit} 
                                        onChange={e => handleScheduleChange(index, 'unit', e.target.value)} 
                                        className="bg-slate-600 text-white border-0 p-2 text-xs font-medium w-20 focus:ring-2 focus:ring-brand-secondary focus:z-10"
                                    >
                                        {POSOLOGY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECCIÓN 3: GESTIÓN DE INVENTARIO (KPI Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Columna 1: Inputs de Stock y Fecha de Conteo */}
                <div className="md:col-span-1 space-y-4">
                    {/* Stock Físico Actual (Card Style) */}
                    <div className={`bg-slate-800 p-4 rounded-3xl border border-slate-700 flex flex-col justify-center relative overflow-hidden group shadow-lg min-h-[100px]`}>
                        <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <PillIcon className="w-12 h-12 text-white" />
                        </div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 z-10 flex flex-col">
                            <span>Stock Contabilizado</span>
                            <span className="text-[9px] text-slate-500 font-normal normal-case">(Actual)</span>
                        </label>
                        <div className="flex items-baseline gap-1 z-10">
                            <input 
                                type="number" 
                                step="any"
                                placeholder="0" 
                                value={stock} 
                                onChange={e => setStock(e.target.value)} 
                                className="w-full bg-transparent border-none text-3xl font-extrabold text-white tracking-tight p-0 focus:ring-0 placeholder-slate-600"
                                required
                            />
                            <select 
                                value={stockUnit} 
                                onChange={e => setStockUnit(e.target.value)} 
                                className="bg-transparent border-none text-xs text-slate-400 font-medium p-0 focus:ring-0 cursor-pointer hover:text-white transition-colors"
                            >
                                {POSOLOGY_UNITS.map(u => <option key={u} value={u} className="bg-slate-800 text-white">{u}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Columna 2 y 3: Fecha Adquisición + KPI */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    
                    {/* Sub-Columna 1: Sumar Stock */}
                    <div className="space-y-4 flex flex-col">
                        <div className="space-y-1">
                             <label className={labelStyle}>SUMAR STOCK (COMPRA/LLEGADA)</label>
                             <input 
                                 type="number" 
                                 step="any"
                                 value={acquisitionQuantity} 
                                 onChange={e => setAcquisitionQuantity(e.target.value)} 
                                 className={inputRounded}
                                 placeholder="+ 0"
                             />
                        </div>

                         {/* Tarjeta Gasto Diario */}
                        <div className="bg-slate-800 p-4 rounded-3xl border border-slate-700 flex flex-col justify-center relative overflow-hidden group shadow-lg flex-1 min-h-[100px]">
                            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <PillIcon className="w-12 h-12 text-white" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Gasto Diario Total</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-extrabold text-white tracking-tight">{dailyExpense > 0 ? dailyExpense : '-'}</span>
                                <span className="text-xs text-slate-400 font-medium">{dailyExpense > 0 ? (schedules.find(s=>Number(s.quantity) > 0)?.unit || 'Unid') : ''}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sub-Columna 2: Cobertura */}
                    <div className="space-y-4 flex flex-col">
                         {/* Fecha Adquisición (Opcional) */}
                        <div className="space-y-1">
                            <label className={labelStyle}>FECHA ADQUISICIÓN (REF)</label>
                            <input 
                                type="date" 
                                value={acquisitionDate} 
                                onChange={e => setAcquisitionDate(e.target.value)} 
                                className={inputRounded}
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>

                        {/* Tarjeta Cobertura */}
                        <div className={`p-4 rounded-3xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 shadow-lg flex-1 ${
                            stockDays < lowStockThreshold && stockDays > 0 ? 'bg-red-500 border-red-600 shadow-red-500/30' : 
                            stockDays >= lowStockThreshold ? 'bg-emerald-500 border-emerald-600 shadow-emerald-500/30' : 
                            'bg-slate-100 border-slate-200'
                        }`}>
                            <p className={`text-[10px] font-bold uppercase mb-1 ${stockDays > 0 ? 'text-white/80' : 'text-slate-400'}`}>Cobertura Estimada</p>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-3xl font-extrabold tracking-tight ${stockDays > 0 ? 'text-white' : 'text-slate-400'}`}>
                                    {stockDays > 0 ? stockDays : '-'}
                                </span>
                                <span className={`text-xs font-medium ${stockDays > 0 ? 'text-white/80' : 'text-slate-400'}`}>Días</span>
                            </div>
                            {stockDays < lowStockThreshold && stockDays > 0 && (
                                <span className="absolute bottom-3 right-3 bg-white/20 px-2 py-1 rounded-lg text-[9px] font-bold text-white tracking-wide backdrop-blur-sm">CRÍTICO</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* SECCIÓN 4: META DATA (Restante) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                 <div className="space-y-1">
                    <label className={labelStyle}>Procedencia</label>
                    <select value={provenance} onChange={e => setProvenance(e.target.value as Provenance)} className={inputRounded}>
                        {PROVENANCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>
                 
                 <div className="space-y-1">
                    <label className={labelStyle}>Próxima Entrega (Opcional)</label>
                    <div className="relative">
                        <input 
                            type="date" 
                            value={deliveryDate} 
                            onChange={e => setDeliveryDate(e.target.value)} 
                            className={inputRounded}
                            style={{ colorScheme: 'dark' }}
                        />
                        {deliveryDate && (
                            <button
                                type="button"
                                onClick={() => setDeliveryDate('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-full transition-colors"
                                title="Borrar fecha"
                            >
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                 </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-3 shrink-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden md:block">
                * Campos obligatorios
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button
                type="button"
                onClick={onClose}
                className="flex-1 md:flex-none px-8 py-3.5 text-slate-500 font-bold rounded-2xl hover:bg-white hover:text-slate-800 hover:shadow-md transition-all border border-transparent hover:border-slate-100"
                >
                Cancelar
                </button>
                <button
                type="submit"
                disabled={!isFormValid}
                className="flex-1 md:flex-none px-8 py-3.5 bg-gradient-to-r from-brand-secondary to-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                >
                {isEditing ? 'Confirmar Stock y Guardar' : 'Guardar'}
                </button>
            </div>
          </div>
          
          {/* Borde Inferior Decorativo */}
          <div className="h-4 bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-secondary w-full shrink-0" />
        </form>
      </div>
    </div>
  );
};

export default AddMedicationModalModern;