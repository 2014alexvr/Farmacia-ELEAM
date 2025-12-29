import React, { useState, useMemo } from 'react';
import { GeneralMedication, User } from '../../types';
import AddGeneralKitModal from './AddGeneralKitModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import FirstAidIcon from '../icons/FirstAidIcon';
import ChevronUpIcon from '../icons/ChevronUpIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';

interface GeneralKitPanelProps {
  user: User;
  items: GeneralMedication[];
  onSaveItem: (item: Omit<GeneralMedication, 'id'> | GeneralMedication) => Promise<void>;
  onDeleteItem: (itemId: number) => Promise<void>;
  onReorderItems: (items: GeneralMedication[]) => Promise<void>;
}

type SortField = 'manual' | 'name' | 'stock';
type SortDirection = 'asc' | 'desc';

const GeneralKitPanel: React.FC<GeneralKitPanelProps> = ({ user, items, onSaveItem, onDeleteItem, onReorderItems }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<GeneralMedication | undefined>(undefined);
  const [itemToDelete, setItemToDelete] = useState<GeneralMedication | null>(null);

  // Estados para el ordenamiento
  const [sortField, setSortField] = useState<SortField>('manual');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const canModify = user.permissions === 'Total' || user.permissions === 'Modificar';

  const filteredAndSortedItems = useMemo(() => {
    // 1. Filtrado
    let result = [...items]; // Clone array
    if (searchTerm.trim()) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(item => 
            item.nombre_medicamento.toLowerCase().includes(lowerTerm)
        );
    }

    // 2. Ordenamiento
    if (sortField === 'manual') {
        // En modo manual, respetamos el orden original (que viene por display_order)
        return result.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    } else {
        return result.sort((a, b) => {
            if (sortField === 'name') {
                return sortDirection === 'asc'
                    ? a.nombre_medicamento.localeCompare(b.nombre_medicamento)
                    : b.nombre_medicamento.localeCompare(a.nombre_medicamento);
            } else {
                // Sort by Stock
                return sortDirection === 'asc'
                    ? a.cantidad_total - b.cantidad_total
                    : b.cantidad_total - a.cantidad_total;
            }
        });
    }
  }, [items, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
        if (field === 'manual') return; // Cannot toggle direction on manual in this context (it's fixed by ID/Display Order)
        
        // Cycle: Asc -> Desc -> Manual
        if (sortDirection === 'asc') {
            setSortDirection('desc');
        } else {
            setSortField('manual');
            setSortDirection('asc');
        }
    } else {
        // Si es una columna nueva, ordenamos ascendente por defecto
        setSortField(field);
        setSortDirection('asc');
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
      // Solo permitir mover si estamos en modo manual y sin búsqueda activa
      if (sortField !== 'manual' || searchTerm) return;

      const newItems = [...items];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex < 0 || targetIndex >= newItems.length) return;

      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;

      // Actualizar display_order
      const updatedItems = newItems.map((item, idx) => ({ ...item, display_order: idx }));
      onReorderItems(updatedItems);
  };

  const handleOpenAdd = () => {
    setItemToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GeneralMedication) => {
    if (!canModify) return;
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Omit<GeneralMedication, 'id'> | GeneralMedication) => {
    await onSaveItem(data);
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
        await onDeleteItem(itemToDelete.id);
        setItemToDelete(null);
    }
  };

  // Componente interno para el icono de ordenamiento
  const SortIcon = ({ active, direction }: { active: boolean; direction: SortDirection }) => (
    <span className={`ml-2 inline-flex flex-col space-y-[2px] ${active ? 'text-brand-primary' : 'text-slate-300'}`}>
        {/* Flecha Arriba */}
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`w-2 h-2 ${active && direction === 'asc' ? 'opacity-100' : 'opacity-40'}`} 
            viewBox="0 0 24 24" 
            fill="currentColor"
        >
            <path d="M12 4l-8 8h16l-8-8z" />
        </svg>
        {/* Flecha Abajo */}
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`w-2 h-2 ${active && direction === 'desc' ? 'opacity-100' : 'opacity-40'}`} 
            viewBox="0 0 24 24" 
            fill="currentColor"
        >
            <path d="M12 20l8-8H4l8 8z" />
        </svg>
    </span>
  );

  return (
    <div className="animate-fade-in-down pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-slate-200 rounded-xl text-slate-600">
                    <FirstAidIcon className="w-6 h-6" />
                </div>
                Botiquín General
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
                Gestión de medicamentos e insumos generales (sin asignación a residentes).
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                ⚠️ El stock de esta sección no se descuenta automáticamente.
            </span>
        </div>
        {canModify && (
            <button
                onClick={handleOpenAdd}
                className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-dark transition-all active:scale-95"
            >
                + Nuevo Ítem
            </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100">
         {/* Search Bar */}
         <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative max-w-md w-full">
                <input
                    type="text"
                    placeholder="Buscar en botiquín..."
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
            
            {/* Sort Status Indicator */}
            {sortField !== 'manual' && (
                <button 
                    onClick={() => { setSortField('manual'); setSortDirection('asc'); }}
                    className="text-xs font-bold text-slate-500 hover:text-brand-primary bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 transition-colors"
                >
                    Filtro Activo: {sortField === 'name' ? 'Nombre' : 'Stock'} ({sortDirection === 'asc' ? 'Asc' : 'Desc'})
                    <span className="ml-2 text-red-400">× Quitar</span>
                </button>
            )}
        </div>

        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th 
                            className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider rounded-tl-2xl cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                            onClick={() => handleSort('name')}
                        >
                            <div className="flex items-center">
                                Medicamento / Insumo
                                <SortIcon active={sortField === 'name'} direction={sortDirection} />
                            </div>
                        </th>
                        <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Formato</th>
                        <th 
                            className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                            onClick={() => handleSort('stock')}
                        >
                            <div className="flex items-center justify-center">
                                Stock Actual
                                <SortIcon active={sortField === 'stock'} direction={sortDirection} />
                            </div>
                        </th>
                        <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Procedencia</th>
                        <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Fecha Adq.</th>
                        {canModify && <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-right rounded-tr-2xl">Acciones</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredAndSortedItems.length > 0 ? (
                        filteredAndSortedItems.map((item, index) => {
                            const isFirst = index === 0;
                            const isLast = index === filteredAndSortedItems.length - 1;
                            const isManualSort = sortField === 'manual' && !searchTerm;

                            return (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-5 py-4 font-bold text-slate-800">
                                        <div className="flex items-center gap-3">
                                            {/* Reorder Arrows (Left of Name) */}
                                            {canModify && isManualSort && (
                                                <div className="flex flex-col items-center gap-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }} 
                                                        disabled={isFirst}
                                                        className={`p-0.5 rounded-md transition-colors ${isFirst ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-white hover:text-brand-primary hover:shadow-sm border border-transparent hover:border-slate-200'}`}
                                                        title="Mover arriba"
                                                    >
                                                        <ChevronUpIcon className="w-3 h-3" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }} 
                                                        disabled={isLast}
                                                        className={`p-0.5 rounded-md transition-colors ${isLast ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-white hover:text-brand-primary hover:shadow-sm border border-transparent hover:border-slate-200'}`}
                                                        title="Mover abajo"
                                                    >
                                                        <ChevronDownIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                            
                                            <span>{item.nombre_medicamento}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600 font-medium">{item.formato}</td>
                                    <td className="px-5 py-4 text-center">
                                        <span className="inline-block px-3 py-1 bg-brand-light text-brand-primary font-bold rounded-lg border border-brand-secondary/20 min-w-[3rem]">
                                            {item.cantidad_total}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500 text-sm">
                                        <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-semibold">
                                            {item.procedencia}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500 text-sm">
                                        {item.fecha_adquisicion ? new Date(item.fecha_adquisicion).toLocaleDateString('es-CL') : '-'}
                                    </td>
                                    {canModify && (
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="p-2 text-slate-500 hover:text-brand-primary hover:bg-white rounded-lg transition-colors"
                                                    title="Editar Stock"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setItemToDelete(item)}
                                                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={6} className="text-center p-12 text-slate-400 italic">
                                No se encontraron ítems en el botiquín.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {isModalOpen && (
        <AddGeneralKitModal 
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            itemToEdit={itemToEdit}
        />
      )}

      {itemToDelete && (
        <ConfirmDeleteModal
            itemName={itemToDelete.nombre_medicamento}
            onConfirm={confirmDelete}
            onCancel={() => setItemToDelete(null)}
        />
      )}

    </div>
  );
};

export default GeneralKitPanel;