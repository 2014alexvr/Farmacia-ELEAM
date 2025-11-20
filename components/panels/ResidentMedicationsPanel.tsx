import React, { useState } from 'react';
import { Resident, ResidentMedication, User, MedicalReport } from '../../types';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import AddMedicationModal from './AddMedicationModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import MedicalReportModal from './MedicalReportModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PrinterIcon from '../icons/PrinterIcon';

interface ResidentMedicationsPanelProps {
  user: User;
  resident: Resident;
  onBack: () => void;
  medications: ResidentMedication[];
  onSaveMedication: (medicationData: Omit<ResidentMedication, 'id' | 'residentId'> | ResidentMedication) => void;
  onDeleteMedication: (medicationId: string) => void;
  medicalReports: MedicalReport[];
  onSaveReport: (report: MedicalReport) => void;
  onDeleteReport: (reportId: string) => void;
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
  medicalReports,
  onSaveReport,
  onDeleteReport
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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(13, 148, 136); // brand-primary Teal-600
    doc.text("FARMACIA ELEAM EL NAZARENO", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Listado de Medicamentos", 14, 30);

    // Información del Residente
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Residente: ${resident.name}`, 14, 42);
    doc.text(`RUT: ${resident.rut}`, 14, 47);
    doc.text(`Fecha de Nacimiento: ${new Date(resident.dateOfBirth).toLocaleDateString('es-CL', { timeZone: 'UTC' })}`, 14, 52);
    doc.text(`Edad: ${age} años`, 140, 42);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-CL')}`, 140, 47);
    
    const tableColumn = ["Medicamento", "Dosis", "Horarios", "Posología", "Gasto", "Stock", "Días", "Procedencia", "Entrega"];
    const tableRows = medications.map(med => {
      const dailyExpense = med.schedules.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      const stockDays = dailyExpense > 0 ? Math.floor(med.stock / dailyExpense) : 'N/A';
      
      const schedulesText = med.schedules
        .filter(s => s.time && s.quantity)
        .map(s => s.time)
        .join('\n');
        
      const posologyText = med.schedules
        .filter(s => s.time && s.quantity)
        .map(s => `${s.quantity} ${s.unit}`)
        .join('\n');

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
      columnStyles: {
          0: { cellWidth: 30 }, 
      }
    });

    doc.save(`Medicamentos_${resident.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="animate-fade-in-down">
      <button onClick={onBack} className="flex items-center text-slate-500 font-semibold mb-6 hover:text-brand-primary transition-colors print:hidden group">
        <div className="p-1 bg-white rounded-full shadow-sm mr-2 group-hover:bg-brand-light transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
        </div>
        Volver al listado
      </button>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{`Ficha de Medicamentos`}</h1>
            <p className="text-slate-500 font-medium mt-1">{resident.name}</p>
          </div>
          <div className="flex flex-wrap gap-3 print:hidden">
              <button 
                type="button"
                onClick={handleExportPDF}
                className="flex items-center px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-sm active:scale-95"
              >
                  <PrinterIcon className="w-5 h-5 mr-2" />
                  Exportar PDF
              </button>
              <button 
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center px-5 py-2.5 bg-brand-secondary text-white font-semibold rounded-xl hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
              >
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Informe Médico
              </button>
          </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 mb-8">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Información del Residente</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Nombre Completo</p>
            <p className="font-bold text-slate-800">{resident.name}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">RUT</p>
            <p className="font-bold text-slate-800">{resident.rut}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Fecha Nacimiento</p>
            <p className="font-bold text-slate-800">{new Date(resident.dateOfBirth).toLocaleDateString('es-CL', { timeZone: 'UTC' })}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Edad Actual</p>
            <p className="font-bold text-slate-800">{age} años</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Listado de Medicamentos</h2>
            {canAdd && (
              <button onClick={handleOpenModalForAdd} className="px-5 py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-dark transition-all active:scale-95 print:hidden">
                  + Agregar Medicamento
              </button>
            )}
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-4 pl-2 font-bold text-xs text-slate-400 uppercase tracking-wider">Medicamento</th>
                <th className="pb-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Dosis</th>
                <th className="pb-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Horarios</th>
                <th className="pb-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Posología</th>
                <th className="pb-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center">Gasto</th>
                <th className="pb-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center">Stock</th>
                <th className="pb-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center">Días</th>
                <th className="pb-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Procedencia</th>
                <th className="pb-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Entrega</th>
                <th className="pb-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center print:hidden">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {medications.length > 0 ? (
                medications.map((med, index) => {
                  const dailyExpense = med.schedules.reduce((sum, s) => sum + s.quantity, 0);
                  const stockDays = dailyExpense > 0 ? Math.floor(med.stock / dailyExpense) : 'N/A';
                  const isLowStock = typeof stockDays === 'number' && stockDays <= 6;
                  
                  return (
                    <tr key={med.id} className={`group border-b border-slate-50 hover:bg-slate-50/80 transition-colors ${isLowStock ? 'bg-red-50/30' : ''}`}>
                      <td className="p-4 font-semibold text-slate-800 align-top rounded-l-xl">
                        <button
                          onClick={() => handleOpenModalForEdit(med)}
                          disabled={!canModify}
                          className={`text-left ${canModify ? 'hover:text-brand-primary transition-colors cursor-pointer' : 'cursor-default'}`}
                        >
                          {med.medicationName}
                        </button>
                      </td>
                      <td className="p-4 text-slate-600 align-top font-medium">{`${med.doseValue} ${med.doseUnit}`}</td>
                      <td className="p-4 text-slate-600 align-top font-mono text-xs">
                        {med.schedules.map((s, i) => (
                          <div key={i} className="h-5 mb-1">{s.time}</div>
                        ))}
                      </td>
                      <td className="p-4 text-slate-600 align-top">
                         {med.schedules.map((s, i) => (
                          <div key={i} className="h-5 mb-1">{`${s.quantity} ${s.unit}`}</div>
                        ))}
                      </td>
                      <td className="p-4 text-center text-slate-600 align-top">{dailyExpense}</td>
                      <td className="p-4 text-center text-slate-800 font-bold align-top">{`${med.stock} ${med.stockUnit}`}</td>
                      <td className="p-4 text-center align-top">
                          <span className={`font-bold ${isLowStock ? 'text-red-500' : 'text-emerald-600'}`}>
                              {stockDays}
                          </span>
                      </td>
                      <td className="p-4 align-top">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full ${
                              med.provenance === 'Cesfam' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                              med.provenance === 'Compras' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              med.provenance === 'Donación' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-slate-100 text-slate-600'
                          }`}>
                              {med.provenance}
                          </span>
                      </td>
                      <td className="p-4 text-slate-600 align-top font-medium">
                        {med.deliveryDate ? new Date(med.deliveryDate).toLocaleDateString('es-CL', { timeZone: 'UTC' }) : 'N/A'}
                      </td>
                      <td className="p-4 text-center align-top print:hidden rounded-r-xl">
                        {canDelete && (
                          <button 
                            onClick={() => setMedicationToDelete(med)}
                            className="text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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
                  <td colSpan={10} className="text-center p-12 text-slate-400 italic">
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
        {isReportModalOpen && (
          <MedicalReportModal 
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