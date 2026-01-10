import React, { useState } from 'react';
import { Resident, ResidentMedication, User, MedicalReport } from '../../types';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import AddMedicationModalModern from './AddMedicationModalModern'; 
import ConfirmDeleteModal from './ConfirmDeleteModal';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import MedicalReportModal from './MedicalReportModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PrinterIcon from '../icons/PrinterIcon';
import ShareIcon from '../icons/ShareIcon';
import ChevronUpIcon from '../icons/ChevronUpIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import TrashIcon from '../icons/TrashIcon';

interface ResidentMedicationsPanelProps {
  user: User;
  resident: Resident;
  onBack: () => void;
  medications: ResidentMedication[];
  onSaveMedication: (medicationData: Omit<ResidentMedication, 'id' | 'residentId'> | ResidentMedication) => void;
  onDeleteMedication: (medicationId: string) => void;
  onReorderMedications: (medications: ResidentMedication[]) => void;
  medicalReports: MedicalReport[];
  onSaveReport: (report: MedicalReport) => void;
  onDeleteReport: (reportId: string) => void;
  lowStockThreshold: number;
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

// --- FUNCIÓN AUXILIAR DE CÁLCULO DE FECHA ---
const calculateRefillDate = (daysRemaining: number | string, threshold: number) => {
    // Caso 1: Stock Indefinido o Error
    if (typeof daysRemaining !== 'number') {
        return { text: '-', className: 'text-slate-400' };
    }

    // Caso 2: Sin Stock o Stock Negativo
    if (daysRemaining <= 0) {
        return { text: 'Agotado', className: 'text-red-600 font-extrabold uppercase text-[10px]' };
    }

    // Caso 3: Cálculo Matemático (Hoy + Días Restantes)
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysRemaining);

    // Formateo dd/mm/aaaa
    const day = String(targetDate.getDate()).padStart(2, '0');
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const year = targetDate.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    // Caso 4: Lógica de Colores (Semáforo)
    let className = 'text-blue-600 font-medium'; // Futuro seguro (Azul)

    if (daysRemaining <= 2) {
        className = 'text-red-600 font-extrabold'; // Crítico (Rojo)
    } else if (daysRemaining < threshold) {
        className = 'text-amber-600 font-bold'; // Alerta (Ámbar)
    }

    return { text: dateStr, className };
};

const ResidentMedicationsPanel: React.FC<ResidentMedicationsPanelProps> = ({ 
  user, 
  resident, 
  onBack, 
  medications, 
  onSaveMedication, 
  onDeleteMedication, 
  onReorderMedications,
  medicalReports,
  onSaveReport,
  onDeleteReport,
  lowStockThreshold
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState<ResidentMedication | null>(null);
  const [medicationToDelete, setMedicationToDelete] = useState<ResidentMedication | null>(null);
  const age = calculateAge(resident.dateOfBirth);

  const canAdd = user.permissions === 'Total' || user.permissions === 'Modificar';
  const canModify = user.permissions === 'Total' || user.permissions === 'Modificar';
  const canDelete = user.permissions === 'Total' || user.permissions === 'Modificar';

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

  const moveMedication = (index: number, direction: 'up' | 'down') => {
      const newMeds = [...medications];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex < 0 || targetIndex >= newMeds.length) return;

      const temp = newMeds[index];
      newMeds[index] = newMeds[targetIndex];
      newMeds[targetIndex] = temp;

      onReorderMedications(newMeds);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(13, 148, 136);
    doc.text("FARMACIA ELEAM EL NAZARENO", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Listado de Medicamentos", 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Residente: ${resident.name}`, 14, 42);
    doc.text(`RUT: ${resident.rut}`, 14, 47);
    doc.text(`Fecha de Nacimiento: ${new Date(resident.dateOfBirth).toLocaleDateString('es-CL', { timeZone: 'UTC' })}`, 14, 52);
    doc.text(`Edad: ${age} años`, 140, 42);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-CL')}`, 140, 47);
    
    const tableColumn = ["Medicamento", "Dosis", "Horarios", "Posología", "Gasto Diario", "Stock", "Días con Stock", "Procedencia", "Próx. Reposición"];
    const tableRows = medications.map(med => {
      // Logic for PDF (consistent with display)
      const dailyExpense = med.schedules.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      
      const anchorDateStr = med.stockUpdatedAt || new Date().toISOString();
      const anchorDate = new Date(anchorDateStr);
      const today = new Date();
      anchorDate.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      const diffTime = today.getTime() - anchorDate.getTime();
      const daysElapsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      const consumed = dailyExpense * daysElapsed;
      const realStock = Math.max(0, med.stock - consumed);

      const stockDays = dailyExpense > 0 ? Math.floor(realStock / dailyExpense) : 'N/A';
      
      // Calculate Refill Date for PDF
      let refillDateText = '';
      if (typeof stockDays === 'number') {
          if (stockDays <= 0) refillDateText = 'Agotado';
          else {
             const d = new Date();
             d.setDate(d.getDate() + stockDays);
             refillDateText = d.toLocaleDateString('es-CL');
          }
      } else {
          refillDateText = '-';
      }
      
      const schedulesText = med.schedules.filter(s => s.time && s.quantity).map(s => s.time).join('\n');
      const posologyText = med.schedules.filter(s => s.time && s.quantity).map(s => `${s.quantity} ${s.unit}`).join('\n');

      return [
        med.medicationName,
        `${med.doseValue} ${med.doseUnit}`,
        schedulesText,
        posologyText,
        dailyExpense.toString(),
        `${parseFloat(realStock.toFixed(2))} ${med.stockUnit}`,
        stockDays.toString(),
        med.provenance,
        refillDateText
      ];
    });

    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [13, 148, 136] },
      styles: { fontSize: 8, cellPadding: 2, valign: 'top' },
      columnStyles: { 0: { cellWidth: 30 } }
    });

    return doc;
  };

  const handleExportPDF = () => {
    const doc = generatePDF();
    doc.save(`Medicamentos_${resident.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleShareList = async () => {
    try {
      const doc = generatePDF();
      const fileName = `Medicamentos_${resident.name.replace(/\s+/g, '_')}.pdf`;
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      if (navigator.share) {
        const shareData: ShareData = {
            files: [file],
            title: `Medicamentos: ${resident.name}`,
            text: `Adjunto listado de medicamentos de ${resident.name}.`,
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
            doc.save(fileName);
            alert("Su dispositivo no permite compartir archivos directamente desde la web. Se ha descargado el PDF.");
        }
      } else {
        doc.save(fileName);
        alert("Su dispositivo no soporta la función de compartir. Se ha descargado el PDF.");
      }
    } catch (error) {
      console.error('Error al compartir/generar PDF:', error);
      alert('Hubo un error al intentar generar o compartir el PDF.');
    }
  };

  // LAYOUT FIX: Re-written for Mobile First.
  return (
    <div className="flex flex-col w-full min-w-full max-w-full items-stretch gap-6 animate-fade-in-down">
      
      {/* Navigation Button */}
      <div className="w-full">
        <button onClick={onBack} className="flex items-center text-slate-500 font-semibold hover:text-brand-primary transition-colors print:hidden group text-sm">
            <div className="p-1 bg-white rounded-full shadow-sm mr-2 group-hover:bg-brand-light transition-colors">
                <ArrowLeftIcon className="w-4 h-4" />
            </div>
            Volver al listado
        </button>
      </div>

      {/* Header Container - Flex Col on Mobile, Flex Row on Large Screens */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 w-full">
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{`Ficha de Medicamentos`}</h1>
            <p className="text-slate-500 font-medium mt-1 text-sm">{resident.name}</p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden w-full lg:w-auto">
              <button 
                  onClick={handleExportPDF} 
                  className="flex-1 lg:flex-none justify-center flex items-center px-4 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-dark transition-all active:scale-95 text-xs"
              >
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Descargar
              </button>
              <button 
                  onClick={handleShareList} 
                  className="flex-1 lg:flex-none justify-center flex items-center px-4 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-dark transition-all active:scale-95 text-xs"
              >
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Compartir
              </button>
              <button 
                  onClick={() => setIsReportModalOpen(true)} 
                  className="flex-1 lg:flex-none justify-center flex items-center px-4 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-dark transition-all active:scale-95 text-xs"
              >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Informes
              </button>
          </div>
      </div>

      {/* STACKED CONTENT: Info on Top, Table on Bottom (For Mobile & Desktop) */}
      <div className="flex flex-col w-full max-w-full gap-6">
          
          {/* Resident Info Card - FORCED WIDTH 100% */}
          <div className="w-full bg-white p-4 rounded-3xl shadow-soft border border-slate-100 block">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Información del Residente</h2>
            {/* Grid Responsive: 1 column on mobile (default), 2 on sm, 4 on md */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <div className="p-3 bg-slate-50 rounded-2xl w-full">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Nombre Completo</p>
                <p className="font-bold text-slate-800 text-sm leading-tight">{resident.name}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl w-full">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">RUT</p>
                <p className="font-bold text-slate-800 text-sm">{resident.rut}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl w-full">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Fecha Nacimiento</p>
                <p className="font-bold text-slate-800 text-sm">{new Date(resident.dateOfBirth).toLocaleDateString('es-CL', { timeZone: 'UTC' })}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl w-full">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Edad Actual</p>
                <p className="font-bold text-slate-800 text-sm">{age} años</p>
              </div>
            </div>
          </div>
          
          {/* Table Container - FORCED WIDTH 100% */}
          <div className="w-full bg-white p-4 rounded-3xl shadow-soft border border-slate-100 block">
            <div className="flex justify-between items-center mb-4 w-full">
                <h2 className="text-lg font-bold text-slate-800">Listado de Medicamentos</h2>
                {canAdd && (
                  <button onClick={handleOpenModalForAdd} className="px-4 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-dark transition-all active:scale-95 print:hidden text-xs whitespace-nowrap">
                      + Agregar
                  </button>
                )}
            </div>
            
            {/* SCROLLABLE TABLE CONTAINER */}
            <div className="w-full overflow-x-auto print:overflow-visible">
              <table className="w-full min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {canModify && <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center print:hidden rounded-tl-xl w-10">#</th>}
                    <th className={`px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider ${!canModify ? 'rounded-tl-xl' : ''}`}>Medicamento</th>
                    <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider">Dosis</th>
                    <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider">Horarios</th>
                    <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider">Posología</th>
                    <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center">Gasto</th>
                    <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center">Stock</th>
                    <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center">Días</th>
                    <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider">Origen</th>
                    <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider">PROX. REPOSICIÓN</th>
                    <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center">CANT. ADQ.</th>
                    <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider">F. ADQ.</th>
                    <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center print:hidden rounded-tr-xl">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medications.length > 0 ? (
                    medications.map((med, index) => {
                      const dailyExpense = med.schedules.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
                      
                      // --- LÓGICA CORREGIDA DE STOCK VIRTUAL ---
                      // Calculamos el stock "en vivo" para que coincida con el modal
                      const anchorDateStr = med.stockUpdatedAt || new Date().toISOString();
                      const anchorDate = new Date(anchorDateStr);
                      const today = new Date();
                      
                      // Normalizar fechas para evitar errores por horas
                      anchorDate.setHours(0,0,0,0);
                      today.setHours(0,0,0,0);
                      
                      const diffTime = today.getTime() - anchorDate.getTime();
                      const daysElapsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
                      
                      const consumed = dailyExpense * daysElapsed;
                      // El stock base es lo que hay en BD, le restamos lo consumido virtualmente desde la última actualización
                      const realStock = Math.max(0, med.stock - consumed);

                      const stockDays = dailyExpense > 0 ? Math.floor(realStock / dailyExpense) : 'N/A';
                      const isLowStock = typeof stockDays === 'number' && stockDays < lowStockThreshold;
                      const isFirst = index === 0;
                      const isLast = index === medications.length - 1;
                      
                      // --- CÁLCULO DE FECHA DE REPOSICIÓN ---
                      const refillInfo = calculateRefillDate(stockDays, lowStockThreshold);

                      return (
                        <tr key={med.id} className={`group hover:bg-slate-50 transition-colors ${isLowStock ? 'bg-red-50/40 hover:bg-red-50/60' : ''}`}>
                          
                          {canModify && (
                            <td className="px-2 py-3 text-center align-top print:hidden">
                                <div className="flex flex-col items-center gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); moveMedication(index, 'up'); }} 
                                        disabled={isFirst}
                                        className={`p-0.5 rounded-md transition-colors ${isFirst ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-white hover:text-brand-primary hover:shadow-sm border border-transparent hover:border-slate-200'}`}
                                    >
                                        <ChevronUpIcon className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); moveMedication(index, 'down'); }} 
                                        disabled={isLast}
                                        className={`p-0.5 rounded-md transition-colors ${isLast ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-white hover:text-brand-primary hover:shadow-sm border border-transparent hover:border-slate-200'}`}
                                    >
                                        <ChevronDownIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            </td>
                          )}

                          <td className="px-2 py-3 align-top">
                            <button onClick={() => handleOpenModalForEdit(med)} disabled={!canModify} className={`text-left text-sm font-bold text-slate-800 ${canModify ? 'hover:text-brand-primary transition-colors cursor-pointer' : 'cursor-default'}`}>
                              {med.medicationName}
                            </button>
                          </td>
                          <td className="px-2 py-3 text-slate-600 align-top font-medium text-sm whitespace-nowrap">{`${med.doseValue} ${med.doseUnit}`}</td>
                          <td className="px-2 py-3 text-slate-600 align-top text-xs">
                            {med.schedules.map((s, i) => <div key={i} className="mb-0.5">{s.time}</div>)}
                          </td>
                          <td className="px-2 py-3 text-slate-600 align-top text-xs whitespace-nowrap">
                             {med.schedules.map((s, i) => <div key={i} className="mb-0.5">{`${s.quantity} ${s.unit}`}</div>)}
                          </td>
                          <td className="px-2 py-3 text-center text-slate-600 align-top text-sm font-semibold">{dailyExpense}</td>
                          <td className="px-2 py-3 text-center text-slate-800 font-bold align-top text-sm whitespace-nowrap">
                              {/* Mostrar el stock calculado REAL, no el de la BD antigua */}
                              {`${parseFloat(realStock.toFixed(2))} ${med.stockUnit}`}
                          </td>
                          <td className="px-2 py-3 text-center align-top text-sm">
                              <span className={`font-bold ${isLowStock ? 'text-red-500' : 'text-emerald-600'}`}>{stockDays}</span>
                          </td>
                          <td className="px-2 py-3 align-top">
                              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full whitespace-nowrap ${
                                  med.provenance === 'Cesfam' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                  med.provenance === 'Compras' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                  'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                  {med.provenance}
                              </span>
                          </td>
                          
                          {/* COLUMNA FECHA DE REPOSICIÓN CALCULADA */}
                          <td className={`px-2 py-3 align-top text-xs whitespace-nowrap ${refillInfo.className}`}>
                            {refillInfo.text}
                          </td>

                          <td className="px-2 py-3 text-slate-600 align-top font-bold text-xs text-center">
                            {med.acquisitionQuantity ? med.acquisitionQuantity : '-'}
                          </td>
                          <td className="px-2 py-3 text-slate-600 align-top font-medium text-xs whitespace-nowrap">
                            {med.acquisitionDate ? new Date(med.acquisitionDate).toLocaleDateString('es-CL', { timeZone: 'UTC' }) : 'N/A'}
                          </td>
                          <td className="px-2 py-3 text-center align-top print:hidden">
                            {canDelete && (
                              <button onClick={() => setMedicationToDelete(med)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                 <span className="sr-only">Eliminar</span>
                                 <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={13} className="text-center p-8 text-slate-400 italic text-sm">Este residente no tiene medicamentos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>

        {isModalOpen && (
            <AddMedicationModalModern 
                onClose={() => { setIsModalOpen(false); setMedicationToEdit(null); }}
                onSave={handleSave}
                medicationToEdit={medicationToEdit || undefined}
                lowStockThreshold={lowStockThreshold}
            />
        )}
        {medicationToDelete && (
            <ConfirmDeleteModal
                itemName={medicationToDelete.medicationName}
                onConfirm={confirmDeletion}
                onCancel={() => setMedicationToDelete(null)}
            />
        )}
        {isReportModalOpen && (
          <MedicalReportModal 
            user={user}
            resident={resident}
            reports={medicalReports}
            onClose={() => setIsReportModalOpen(false)}
            onSaveReport={onSaveReport}
            onDeleteReport={onDeleteReport}
          />
        )}
    </div>
  );
};

export default ResidentMedicationsPanel;