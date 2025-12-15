import React, { useMemo, useState } from 'react';
import UsersIcon from '../icons/UsersIcon';
import PillIcon from '../icons/PillIcon';
import { User, Resident, ResidentMedication, Panel } from '../../types';
import ChartBarIcon from '../icons/ChartBarIcon';
import HeartPulseIcon from '../icons/HeartPulseIcon';
import ArrowRightIcon from '../icons/ArrowRightIcon';
import BellIcon from '../icons/BellIcon';
import SettingsIcon from '../icons/SettingsIcon';

interface DashboardProps {
    user: User;
    residents: Resident[];
    residentMedications: ResidentMedication[];
    onNavigate: (panel: Panel) => void;
    lowStockThreshold: number;
    onUpdateThreshold: (newThreshold: number) => void;
    onForceDailyUpdate: () => Promise<void>;
}

const DashboardModern: React.FC<DashboardProps> = ({ user, residents, residentMedications, onNavigate, lowStockThreshold, onUpdateThreshold, onForceDailyUpdate }) => {
    const [isProcessingUpdate, setIsProcessingUpdate] = useState(false);
    const canEditThreshold = user.permissions !== 'Solo Lectura';

    const lowStockMedications = useMemo(() => {
        return residentMedications.reduce((count, med) => {
             const dailyExpense = med.schedules.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
             if (dailyExpense > 0) {
                 const stockDays = Math.floor(med.stock / dailyExpense);
                 if (stockDays < lowStockThreshold) {
                     return count + 1;
                 }
             }
             return count;
        }, 0);
    }, [residentMedications, lowStockThreshold]);
    
    const uniqueMedicationTypes = useMemo(() => {
        const names = new Set(residentMedications.map(m => m.medicationName.trim()));
        return names.size;
    }, [residentMedications]);

    const isCriticalStock = lowStockMedications > 0;

    const handleForceUpdateClick = async () => {
        setIsProcessingUpdate(true);
        try {
            await onForceDailyUpdate();
        } finally {
            setIsProcessingUpdate(false);
        }
    };

  return (
    <div className="animate-fade-in-down pb-12">
      {/* Header Section */}
      <div className="relative bg-white rounded-[30px] shadow-soft border border-slate-100 p-8 mb-8 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary" />
        <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-brand-light rounded-2xl text-brand-primary shadow-sm border border-brand-secondary/20 hidden sm:block">
                <HeartPulseIcon className="w-10 h-10" />
            </div>
            <div>
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Bienvenido, {user.name}</h1>
                <p className="text-slate-500 mt-2 font-medium text-lg">Panel de Control</p>
            </div>
        </div>
      </div>

      {/* KPI Grid - DISEÑO TARJETAS GRIS (RESIDENTES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Card 1: Total Residentes */}
        <div
            onClick={() => onNavigate(Panel.Residents)}
            className="group bg-slate-200 rounded-3xl shadow-lg shadow-slate-300/50 border border-slate-300 flex flex-col w-full transition-all duration-300 hover:shadow-2xl hover:shadow-slate-600/50 hover:-translate-y-2 hover:bg-slate-50 hover:border-brand-primary/50 overflow-hidden cursor-pointer relative min-h-[220px]"
        >
            {/* Barra Decorativa */}
            <div className="h-2 bg-gradient-to-r from-brand-primary to-brand-secondary w-full shrink-0"></div>
            
            <div className="p-8 flex flex-col justify-between flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover:text-brand-primary transition-colors">Total Residentes</h3>
                        <div className="flex items-baseline gap-2">
                             <p className="text-4xl font-extrabold text-slate-800 tracking-tighter">{residents.length}</p>
                             <span className="text-lg font-medium text-slate-500">Activos</span>
                        </div>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-brand-primary shadow-sm border border-slate-200 group-hover:scale-110 transition-transform">
                        <UsersIcon className="w-7 h-7" />
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-300/50 group-hover:border-slate-200 transition-colors flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500 group-hover:text-brand-secondary transition-colors">
                        Ver listado completo
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-400 group-hover:text-brand-primary group-hover:bg-white transition-all">
                        <ArrowRightIcon className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
        
        {/* Card 2: Tipos de Medicamentos */}
        <div
            onClick={() => onNavigate(Panel.GeneralInventory)}
            className="group bg-slate-200 rounded-3xl shadow-lg shadow-slate-300/50 border border-slate-300 flex flex-col w-full transition-all duration-300 hover:shadow-2xl hover:shadow-slate-600/50 hover:-translate-y-2 hover:bg-slate-50 hover:border-brand-primary/50 overflow-hidden cursor-pointer relative min-h-[220px]"
        >
            {/* Barra Decorativa */}
            <div className="h-2 bg-gradient-to-r from-brand-primary to-brand-secondary w-full shrink-0"></div>
            
            <div className="p-8 flex flex-col justify-between flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover:text-brand-primary transition-colors">Tipos de Medicamentos</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-extrabold text-slate-800 tracking-tighter">{uniqueMedicationTypes}</p>
                            <span className="text-lg font-medium text-slate-500">Variedades</span>
                        </div>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-slate-200 group-hover:scale-110 transition-transform">
                        <PillIcon className="w-7 h-7" />
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-300/50 group-hover:border-slate-200 transition-colors flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500 group-hover:text-emerald-600 transition-colors">
                        Consultar inventario
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-white transition-all">
                         <ArrowRightIcon className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
        
        {/* Card 3: Bajo Stock */}
        <div
            onClick={() => onNavigate(Panel.SummaryCesfam)}
            className={`group bg-slate-200 rounded-3xl shadow-lg shadow-slate-300/50 border border-slate-300 flex flex-col w-full transition-all duration-300 hover:shadow-2xl hover:shadow-slate-600/50 hover:-translate-y-2 hover:bg-slate-50 overflow-hidden cursor-pointer relative min-h-[220px] ${
                isCriticalStock ? 'hover:border-red-500/50' : 'hover:border-emerald-500/50'
            }`}
        >
            {/* Barra Decorativa Dinámica */}
            <div className={`h-2 w-full shrink-0 ${isCriticalStock ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'}`}></div>
            
            <div className="p-8 flex flex-col justify-between flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 transition-colors ${isCriticalStock ? 'text-red-500 group-hover:text-red-600' : 'text-emerald-600 group-hover:text-emerald-700'}`}>
                            {isCriticalStock ? '⚠️ Alerta de Stock' : 'Stock Óptimo'}
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <p className={`text-4xl font-extrabold tracking-tighter ${isCriticalStock ? 'text-red-600' : 'text-slate-800'}`}>{lowStockMedications}</p>
                            <span className="text-lg font-medium text-slate-500">Críticos</span>
                        </div>
                    </div>
                    <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 group-hover:scale-110 transition-transform ${isCriticalStock ? 'text-red-500' : 'text-emerald-500'}`}>
                        <ChartBarIcon className="w-7 h-7" />
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-300/50 group-hover:border-slate-200 transition-colors flex justify-between items-center">
                     <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                        isCriticalStock 
                            ? 'bg-red-100 text-red-700 group-hover:bg-red-200' 
                            : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
                     }`}>
                        {isCriticalStock ? 'Revisar Urgente' : 'Todo en orden'}
                     </span>
                     <div className={`w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-400 group-hover:bg-white transition-all ${isCriticalStock ? 'group-hover:text-red-500' : 'group-hover:text-emerald-500'}`}>
                        <ArrowRightIcon className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>

      </div>
      
      {/* Configuration Section */}
      <div className="bg-white p-6 rounded-[30px] shadow-soft border border-slate-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500 border border-emerald-100">
                <BellIcon className="w-6 h-6" />
            </div>
            <div>
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Configuración de Alerta Global</h2>
                 <p className="text-slate-500 font-medium">Defina el umbral de días para considerar un stock como crítico.</p>
            </div>
         </div>
         <div className="flex flex-col items-end">
            <div className={`flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border ${!canEditThreshold ? 'opacity-75' : 'border-slate-200'}`}>
                <button 
                    onClick={() => onUpdateThreshold(Math.max(1, lowStockThreshold - 1))}
                    disabled={!canEditThreshold}
                    className="w-10 h-10 rounded-xl bg-white text-slate-600 font-bold shadow-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl border border-slate-200 transition-all"
                >
                    -
                </button>
                <div className="text-center min-w-[80px]">
                    <p className="text-2xl font-extrabold text-brand-primary leading-none">{lowStockThreshold}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Días</p>
                </div>
                <button 
                    onClick={() => onUpdateThreshold(lowStockThreshold + 1)}
                    disabled={!canEditThreshold}
                    className="w-10 h-10 rounded-xl bg-white text-slate-600 font-bold shadow-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl border border-slate-200 transition-all"
                >
                    +
                </button>
            </div>
            {!canEditThreshold && (
                <span className="text-[10px] text-amber-600 font-bold mt-2 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                    🔒 Sólo Lectura
                </span>
            )}
         </div>
      </div>

      {/* DIAGNOSTIC TOOLS SECTION */}
      <div className="bg-slate-100 border border-slate-200 rounded-[30px] p-8 mb-8">
          <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className={!canEditThreshold ? "opacity-50" : ""}>
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <SettingsIcon className="w-6 h-6 text-brand-primary" />
                          Herramientas de Diagnóstico
                      </h3>
                      <p className="text-slate-500 mt-1 max-w-xl">
                          Use esta herramienta para <strong>forzar</strong> el descuento del consumo diario inmediatamente. Esto permite verificar que el inventario disminuye sin esperar al día siguiente.
                      </p>
                   </div>
                   
                   <div className="flex flex-col items-end gap-2">
                        <button 
                            onClick={handleForceUpdateClick}
                            disabled={isProcessingUpdate || !canEditThreshold}
                            className={`px-6 py-3 font-bold rounded-xl shadow-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                                !canEditThreshold 
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                                : 'bg-brand-primary text-white shadow-brand-primary/20 hover:bg-brand-dark active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                        >
                            {isProcessingUpdate ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <HeartPulseIcon className="w-5 h-5" />
                                    Procesar Consumo del Día Ahora
                                </>
                            )}
                        </button>
                        
                        {!canEditThreshold && (
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 flex items-center gap-1">
                                🔒 Sólo Lectura
                            </span>
                        )}
                   </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardModern;