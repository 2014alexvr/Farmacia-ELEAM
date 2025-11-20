
import React, { useState, useRef } from 'react';
import { Resident, MedicalReport } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import UploadIcon from '../icons/UploadIcon';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import TrashIcon from '../icons/TrashIcon';
import EyeIcon from '../icons/EyeIcon';

interface MedicalReportModalProps {
  resident: Resident;
  reports: MedicalReport[];
  onClose: () => void;
  onSaveReport: (report: MedicalReport) => void;
  onDeleteReport: (reportId: string) => void;
}

const MedicalReportModal: React.FC<MedicalReportModalProps> = ({ resident, reports, onClose, onSaveReport, onDeleteReport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setSelectedFile(files[0]);
    } else {
      alert('Por favor, suba solo archivos PDF.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    
    // Simulate reading file and converting to base64
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = () => {
      const base64 = reader.result as string;
      
      const newReport: MedicalReport = {
        id: `REP-${Date.now()}`,
        residentId: resident.id,
        fileName: selectedFile.name,
        fileData: base64,
        uploadDate: new Date().toISOString(),
      };

      setTimeout(() => {
        onSaveReport(newReport);
        setUploading(false);
        setSelectedFile(null);
      }, 1000); // Simulate network delay
    };
  };

  const handleDownload = (report: MedicalReport) => {
    const link = document.createElement('a');
    link.href = report.fileData;
    link.download = report.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (report: MedicalReport) => {
    try {
      // Convert Base64 to Blob to avoid browser limitations with large Data URIs
      const base64Data = report.fileData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Open the Blob URL in a new tab
      window.open(url, '_blank');
      
    } catch (error) {
      console.error("Error generating PDF blob:", error);
      alert("No se pudo abrir el archivo. Intente descargarlo.");
    }
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative animate-fade-in-down flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                  <DocumentTextIcon className="w-6 h-6" />
               </div>
               <div>
                  <h2 className="text-xl font-bold text-gray-800">Informes Médicos</h2>
                  <p className="text-sm text-gray-600">Residente: {resident.name}</p>
               </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer mb-8 ${
                isDragging ? 'border-brand-secondary bg-blue-50' : 'border-gray-300 hover:border-brand-secondary hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
              />
              
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <DocumentTextIcon className="w-12 h-12 text-brand-primary mb-2" />
                  <p className="text-lg font-semibold text-gray-700">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 mb-4">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  <div className="flex gap-3">
                      <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                          className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                          disabled={uploading}
                          className="px-4 py-2 text-sm text-white bg-brand-primary rounded-md hover:bg-brand-dark disabled:bg-gray-400"
                      >
                          {uploading ? 'Subiendo...' : 'Confirmar Subida'}
                      </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center pointer-events-none">
                  <UploadIcon className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-lg font-medium text-gray-600">Arrastre su archivo PDF aquí</p>
                  <p className="text-sm text-gray-400 mt-1">o haga clic para seleccionar desde su dispositivo</p>
                </div>
              )}
            </div>

            {/* List of Reports */}
            <h3 className="text-lg font-bold text-gray-800 mb-4">Historial de Informes</h3>
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow gap-3">
                    <div className="flex items-center gap-4 overflow-hidden w-full sm:flex-1">
                      <div className="flex-shrink-0 p-2 bg-white rounded-lg border border-gray-200">
                           <DocumentTextIcon className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 truncate" title={report.fileName}>{report.fileName}</p>
                          <p className="text-xs text-gray-500">Subido el {new Date(report.uploadDate).toLocaleDateString()} a las {new Date(report.uploadDate).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto sm:ml-4">
                      <button 
                          onClick={() => handleView(report)}
                          className="flex items-center px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
                          title="Ver documento"
                      >
                          <EyeIcon className="w-4 h-4 mr-1.5" />
                          Ver Informe
                      </button>
                      <button 
                          onClick={() => handleDownload(report)}
                          className="px-3 py-1.5 text-sm font-medium text-brand-primary bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                          title="Descargar archivo"
                      >
                          Descargar
                      </button>
                      <button 
                          onClick={() => onDeleteReport(report.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar informe"
                      >
                          <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p className="text-gray-500">No hay informes médicos guardados para este residente.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end items-center p-6 border-t bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedicalReportModal;
