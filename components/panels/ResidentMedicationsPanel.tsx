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
    
    const tableColumn = ["Medicamento", "Dosis", "Horarios", "Posología", "Gasto Diario", "Stock", "Días con Stock", "Procedencia", "Fecha de Entrega"];
    const tableRows = medications.map(med => {
      const dailyExpense = med.schedules.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      const stockDays = dailyExpense > 0 ? Math.floor(med.stock / dailyExpense) : 'N/A';
      
      const schedulesText = med.schedules.filter(s => s.time && s.quantity).map(s => s.time).join('\n');
      const posologyText = med.schedules.filter(s => s.time && s.quantity).map(s => `${s.quantity} ${s.unit}`).join('\n');

      return [
        med.medicationName,
        `${med.doseValue} ${med.doseUnit}`,
        schedulesText,
        posologyText,
        dailyExpense.toString(),
        `${med.stock} ${med.stockUnit}`,
        stockDays.toString(),
        med.provenance,
        med.deliveryDate ? new Date(med.deliveryDate).toLocaleDateString('es-CL', { timeZone: 'UTC' }) : ''
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

        // Check if file sharing is supported
        if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
            // Fallback for browsers that support share but not files
            console.warn("El dispositivo soporta compartir, pero no archivos directamente. Descargando...");
            doc.save(fileName);
            alert("Su dispositivo no permite compartir archivos directamente desde la web. Se ha descargado el PDF para que pueda compartirlo manualmente.");
        }
      } else {
        // Fallback for desktop/unsupported browsers
        doc.save(fileName);
        alert("Su dispositivo no soporta la función de compartir. Se ha descargado el PDF.");
      }
    } catch (error) {
      console.error('Error al compartir/generar PDF:', error);
      alert('Hubo un error al intentar generar o compartir el PDF.');
    }
  };

  return (
    <div className="animate-fade-in-down">
      <button onClick={onBack} className="flex items-center text-slate-500 font-semibold mb-6 hover:text-brand-primary transition-colors print:hidden group text-sm">
        <div className="p-1 bg-white rounded-full shadow-sm mr-2 group-hover:bg-brand-light transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
        </div>
        Volver al listado
      </button>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{`Ficha de Medicamentos`}</h1>
            <p className="text-slate-500 font-medium mt-1 text-sm">{resident.name}</p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
              <button 
                  onClick={handleExportPDF} 
                  className="flex items-center px-4 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-dark transition-all active:scale-95 text-xs"
              >
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Descargar
              </button>
              <button 
                  onClick={handleShareList} 
                  className="flex items-center px-4 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-dark transition-all active:scale-95 text-xs"
              >
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Compartir
              </button>
              <button 
                  onClick={() => setIsReportModalOpen(true)} 
                  className="flex items-center px-4 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-dark transition-all active:scale-95 text-xs"
              >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Informes
              </button>
          </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-soft border border-slate-100 mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Información del Residente</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Nombre Completo</p>
            <p className="font-bold text-slate-800 text-sm leading-tight">{resident.name}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">RUT</p>
            <p className="font-bold text-slate-800 text-sm">{resident.rut}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Fecha Nacimiento</p>
            <p className="font-bold text-slate-800 text-sm">{new Date(resident.dateOfBirth).toLocaleDateString('es-CL', { timeZone: 'UTC' })}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Edad Actual</p>
            <p className="font-bold text-slate-800 text-sm">{age} años</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-3xl shadow-soft border border-slate-100">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Listado de Medicamentos</h2>
            {canAdd && (
              <button onClick={handleOpenModalForAdd} className="px-4 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-dark transition-all active:scale-95 print:hidden text-xs">
                  + Agregar
              </button>
            )}
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left border-collapse">
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
                <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider">F. Entrega</th>
                
                {/* Nuevas Columnas Solicitadas */}
                <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center">CANT. ADQ.</th>
                <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider">F. ADQ.</th>
                
                <th className="px-2 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center print:hidden rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medications.length > 0 ? (
                medications.map((med, index) => {
                  const dailyExpense = med.schedules.reduce((sum, s) => sum + s.quantity, 0);
                  const stockDays = dailyExpense > 0 ? Math.floor(med.stock / dailyExpense) : 'N/A';
                  const isLowStock = typeof stockDays === 'number' && stockDays < lowStockThreshold;
                  const isFirst = index === 0;
                  const isLast = index === medications.length - 1;
                  
                  return (
                    <tr key={med.id} className={`group hover:bg-slate-50 transition-colors ${isLowStock ? 'bg-red-50/40 hover:bg-red-50/60' : ''}`}>
                      
                      {/* Columna de Orden (Inicio) */}
                      {canModify && (
                        <td className="px-2 py-3 text-center align-top print:hidden">
                            <div className="flex flex-col items-center gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); moveMedication(index, 'up'); }} 
                                    disabled={isFirst}
                                    className={`p-0.5 rounded-md transition-colors ${isFirst ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-white hover:text-brand-primary hover:shadow-sm border border-transparent hover:border-slate-200'}`}
                                    title="Mover arriba"
                                >
                                    <ChevronUpIcon className="w-3 h-3" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); moveMedication(index, 'down'); }} 
                                    disabled={isLast}
                                    className={`p-0.5 rounded-md transition-colors ${isLast ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-white hover:text-brand-primary hover:shadow-sm border border-transparent hover:border-slate-200'}`}
                                    title="Mover abajo"
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
                      <td className="px-2 py-3 text-center text-slate-800 font-bold align-top text-sm whitespace-nowrap">{`${med.stock} ${med.stockUnit}`}</td>
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
                      <td className="px-2 py-3 text-slate-600 align-top font-medium text-xs whitespace-nowrap">
                        {med.deliveryDate ? new Date(med.deliveryDate).toLocaleDateString('es-CL', { timeZone: 'UTC' }) : 'N/A'}
                      </td>

                      {/* Datos de Adquisición */}
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
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                             </svg>
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