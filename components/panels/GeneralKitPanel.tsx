import React, { useState, useMemo } from 'react';
import { GeneralMedication, User } from '../../types';
import AddGeneralKitModal from './AddGeneralKitModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import FirstAidIcon from '../icons/FirstAidIcon';
import ChevronUpIcon from '../icons/ChevronUpIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import DownloadIcon from '../icons/UploadIcon'; // Re-using upload as import visual

interface GeneralKitPanelProps {
  user: User;
  items: GeneralMedication[];
  onSaveItem: (item: Omit<GeneralMedication, 'id'> | GeneralMedication) => Promise<void>;
  onDeleteItem: (itemId: number) => Promise<void>;
  onReorderItems: (items: GeneralMedication[]) => Promise<void>;
  onImportList: () => Promise<void>;
}

type SortField = 'manual' | 'name' | 'stock';
type SortDirection = 'asc' | 'desc';

const GeneralKitPanel: React.FC<GeneralKitPanelProps> = ({ user, items, onSaveItem, onDeleteItem, onReorderItems, onImportList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<GeneralMedication | undefined>(undefined);
  const [itemToDelete, setItemToDelete] = useState<GeneralMedication | null>(null);

  const [sortField, setSortField] = useState<SortField>('manual');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const canModify = user.permissions === 'Total' || user.permissions === 'Modificar';
  
  // Show arrows as long as we are not searching. 
  // If sorted by Name/Stock, clicking an arrow will switch to Manual sort.
  const canReorder = canModify && !searchTerm;

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];
    if (searchTerm.trim()) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(item => 
            item.nombre_medicamento.toLowerCase().includes(lowerTerm)
        );
    }

    if (sortField === 'manual') {
        return result.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    } else {
        return result.sort((a, b) => {
            if (sortField === 'name') {
                return sortDirection === 'asc' ? a.nombre_medicamento.localeCompare(b.nombre_medicamento) : b.nombre_medicamento.localeCompare(a.nombre_medicamento);
            } else {
                return sortDirection === 'asc' ? a.cantidad_total - b.cantidad_total : b.cantidad_total - a.cantidad_total;
            }
        });
    }
  }, [items, searchTerm, sortField, sortDirection]);

  const handleOpenAdd = () => {
    console.log("Abriendo modal para nuevo ítem...");
    setItemToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GeneralMedication) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Omit<GeneralMedication, 'id'> | GeneralMedication) => {
    try {
        await onSaveItem(data);
        setIsModalOpen(false);
    } catch (e: any) {
        alert("Error al guardar ítem: " + (e.message || "Error desconocido."));
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
        try {
            await onDeleteItem(itemToDelete.id);
            setItemToDelete(null);
        } catch (e: any) {
            alert("Error al eliminar ítem: " + (e.message || "Error desconocido."));
        }
    }
  };

  const handleImportClick = async () => {
      console.log("Iniciando carga de lista de imagen...");
      try {
          await onImportList();
      } catch (e: any) {
          alert("Error al importar lista: " + (e.message || "Error desconocido."));
      }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
      if (!canReorder) return;
      
      const newItems = [...filteredAndSortedItems];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex < 0 || targetIndex >= newItems.length) return;

      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;

      const itemsWithOrder = newItems.map((item, idx) => ({ ...item, display_order: idx }));
      
      // Automatically switch to manual sort to reflect the new custom order
      setSortField('manual');
      
      await onReorderItems(itemsWithOrder);
  };

  const handleHeaderSort = (field: SortField) => {
      if (sortField === field) {
          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortField(field);
          setSortDirection('asc');
      }
  };

  const SortIcon = ({ active, direction }: { active: boolean; direction: SortDirection }) => (
    <span className={`ml-2 inline-flex flex-col space-y-[2px] ${active ? 'text-brand-primary' : 'text-slate-300'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-2 h-2 ${active && direction === 'asc' ? 'opacity-100' : 'opacity-40'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-8 8h16l-8-8z" /></svg>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-2 h-2 ${active && direction === 'desc' ? 'opacity-100' : 'opacity-40'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l8-8H4l8 8z" /></svg>
    </span>
  );

  return (
    <div className="animate-fade-in-down pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <FirstAidIcon className="w-6 h-6" />
                </div>
                Botiquín General
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Inventario común del establecimiento.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            {canModify && (
                <>
                  <button
                      onClick={handleImportClick}
                      className="px-6 py-3 bg-white border border-brand-primary text-brand-primary font-bold rounded-xl shadow-sm hover:bg-brand-light transition-all flex items-center gap-2"
                  >
                      <DownloadIcon className="w-5 h-5" />
                      Cargar Lista de Imagen
                  </button>
                  <button
                      onClick={handleOpenAdd}
                      className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-dark transition-all active:scale-95"
                  >
                      + Nuevo Ítem
                  </button>
                </>
            )}
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-soft border border-slate-100">
         <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <input
                type="text"
                placeholder="Buscar en botiquín..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-brand-primary transition-all shadow-sm"
            />
            
            {/* Sorting Controls */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Orden:</span>
                <select 
                    value={sortField} 
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm font-bold focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer"
                >
                    <option value="manual">Manual</option>
                    <option value="name">Alfabético</option>
                    <option value="stock">Stock</option>
                </select>
                {sortField !== 'manual' && (
                    <button 
                        onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-brand-primary"
                    >
                        {sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-50">
                    <tr>
                        {canReorder && <th className="px-2 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider rounded-tl-2xl text-center w-16">#</th>}
                        <th 
                            onClick={() => handleHeaderSort('name')}
                            className={`px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none group ${!canReorder ? 'rounded-tl-2xl' : ''}`}
                        >
                            <div className="flex items-center">
                                Nombre
                                <SortIcon active={sortField === 'name'} direction={sortDirection} />
                            </div>
                        </th>
                        <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Formato</th>
                        <th 
                            onClick={() => handleHeaderSort('stock')}
                            className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                        >
                            <div className="flex items-center justify-center">
                                Stock
                                <SortIcon active={sortField === 'stock'} direction={sortDirection} />
                            </div>
                        </th>
                        <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Procedencia</th>
                        {canModify && <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-right rounded-tr-2xl">Acciones</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredAndSortedItems.length > 0 ? (
                        filteredAndSortedItems.map((item, index) => {
                            const isFirst = index === 0;
                            const isLast = index === filteredAndSortedItems.length - 1;
                            
                            return (
                                <tr key={item.id || `item-${index}`} className="hover:bg-slate-50 transition-colors group">
                                    {canReorder && (
                                        <td className="px-2 py-4 align-middle text-center">
                                            <div className="flex flex-col items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }}
                                                    disabled={isFirst}
                                                    className={`p-1.5 rounded-lg transition-colors ${isFirst ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-white hover:text-brand-primary hover:shadow-sm border border-transparent hover:border-slate-200'}`}
                                                >
                                                    <ChevronUpIcon className="w-6 h-6" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }}
                                                    disabled={isLast}
                                                    className={`p-1.5 rounded-lg transition-colors ${isLast ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-white hover:text-brand-primary hover:shadow-sm border border-transparent hover:border-slate-200'}`}
                                                >
                                                    <ChevronDownIcon className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-5 py-4 font-bold text-slate-800 align-middle">
                                        {canModify ? (
                                            <button 
                                                onClick={() => handleOpenEdit(item)}
                                                className="text-left hover:text-brand-primary hover:underline transition-colors decoration-2 underline-offset-2"
                                                title="Editar ítem"
                                            >
                                                {item.nombre_medicamento}
                                            </button>
                                        ) : (
                                            item.nombre_medicamento
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-slate-600 font-medium align-middle">{item.formato}</td>
                                    <td className="px-5 py-4 text-center align-middle">
                                        <span className="inline-block px-3 py-1 bg-brand-light text-brand-primary font-bold rounded-lg border border-brand-secondary/10">
                                            {item.cantidad_total}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500 text-sm align-middle">{item.procedencia}</td>
                                    {canModify && (
                                        <td className="px-5 py-4 text-right align-middle">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleOpenEdit(item)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-white rounded-lg transition-colors"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => setItemToDelete(item)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={canReorder ? 6 : 5} className="text-center p-12 text-slate-400 italic">
                                {items.length === 0 ? "El botiquín está vacío. Use el botón superior para cargar los datos." : "No se encontraron resultados para su búsqueda."}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {isModalOpen && (
        <AddGeneralKitModal onClose={() => setIsModalOpen(false)} onSave={handleSave} itemToEdit={itemToEdit} />
      )}

      {itemToDelete && (
        <ConfirmDeleteModal itemName={itemToDelete.nombre_medicamento} onConfirm={confirmDelete} onCancel={() => setItemToDelete(null)} />
      )}
    </div>
  );
};

export default GeneralKitPanel;