import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { User, Panel, Resident, ResidentMedication, ManagedUser, MedicalReport, GeneralMedication } from '../types';
import { ROLE_PANELS, MOCK_RESIDENTS } from '../constants';
import Sidebar from './Sidebar';
import DashboardModern from './panels/DashboardModern';
import { ResidentsPanel } from './panels/ResidentsPanel';
import MedicationsPanel from './panels/MedicationsPanel';
import SummaryCesfamPanel from './panels/SummaryCesfamPanel';
import SummaryIndividualStockPanel from './panels/SummaryIndividualStockPanel';
import ResidentMedicationsPanel from './panels/ResidentMedicationsPanel';
import SummaryFamilyPanel from './panels/SummaryFamilyPanel';
import ConfirmLogoutModal from './panels/ConfirmLogoutModal';
import MenuIcon from './icons/MenuIcon';
import AdminAppPanel from './panels/AdminAppPanel';
import GeneralInventoryPanel from './panels/GeneralInventoryPanel';
import GeneralKitPanel from './panels/GeneralKitPanel';
import { supabase } from '../supabaseClient';
import readXlsxFile from 'read-excel-file';

interface MainLayoutProps {
  user: User;
  onLogout: () => void;
  users: ManagedUser[];
  setUsers: React.Dispatch<React.SetStateAction<ManagedUser[]>>;
  onUsersMutated: () => Promise<void>;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user, onLogout, users, setUsers, onUsersMutated }) => {
  const availablePanels = useMemo(() => ROLE_PANELS[user.role], [user.role]);
  const [activePanel, setActivePanel] = useState<Panel>(availablePanels[0] || Panel.Dashboard);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // States for data
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentMedications, setResidentMedications] = useState<ResidentMedication[]>([]);
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([]);
  const [generalKitItems, setGeneralKitItems] = useState<GeneralMedication[]>([]);
  
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(7);

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
      setLoadingData(true);
      try {
        // Settings
        const { data: settingsData } = await supabase.from('app_settings').select('value').eq('key', 'low_stock_threshold').single();
        if (settingsData) setLowStockThreshold(parseInt(settingsData.value, 10));

        // Residents
        const { data: residentsData } = await supabase.from('residents').select('*').order('display_order', { ascending: true });
        if (residentsData) {
          setResidents(residentsData.map((r: any) => ({
             id: r.id, name: r.name, rut: r.rut, dateOfBirth: r.date_of_birth, displayOrder: r.display_order
          })));
        }

        // Resident Medications
        const { data: medsDataRaw } = await supabase.from('resident_medications').select('*');
        if (medsDataRaw) {
            const mappedMeds = medsDataRaw.map((m: any) => {
                let schedules = m.schedules;
                if (typeof schedules === 'string') {
                    try { schedules = JSON.parse(schedules); } catch(e) { schedules = []; }
                }
                return {
                    id: m.id, residentId: m.resident_id, medicationName: m.medication_name,
                    doseValue: m.dose_value, doseUnit: m.dose_unit, schedules: Array.isArray(schedules) ? schedules : [],
                    stock: m.stock, stockUnit: m.stock_unit, provenance: m.provenance,
                    acquisitionDate: m.fecha_de_adquisicion, acquisitionQuantity: m.cantidad_de_adquisicion, 
                    deliveryDate: m.delivery_date, stockUpdatedAt: m.stock_updated_at, displayOrder: m.orden_personalizado || 0
                };
            });
            mappedMeds.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
            setResidentMedications(mappedMeds);
        }

        // General Kit (Botiquín) - Removed order by display_order as column does not exist
        const { data: generalKitData } = await supabase.from('farmacia_general_stock').select('*').order('nombre_medicamento', { ascending: true });
        if (generalKitData) {
            setGeneralKitItems(generalKitData);
        }

        // Reports
        const { data: sqlReportsData } = await supabase.from('medical_reports').select('*');
        if (sqlReportsData) {
            setMedicalReports(sqlReportsData.map((r: any) => ({
                id: r.id, residentId: r.resident_id, fileName: r.file_name, fileData: r.file_data, uploadDate: r.upload_date
            })));
        }

      } catch (error: any) {
        console.error("Error loading data from Supabase:", error.message || error);
      } finally {
        setLoadingData(false);
      }
  }, []); 
  
  useEffect(() => {
    fetchData();
  }, [fetchData]); 

  // --- GENERAL KIT ACTIONS (WITH EXCEL IMPORT) ---
  const handleImportGeneralKit = useCallback(async (file: File) => {
      setLoadingData(true);
      try {
          // 1. Read Excel File
          const rows = await readXlsxFile(file);
          
          if (rows.length < 2) {
              throw new Error("El archivo parece estar vacío o no contiene datos suficientes.");
          }

          // 2. Identify Headers (Normalize to lowercase for simpler matching)
          const headers = rows[0].map((h: any) => String(h).toLowerCase().trim());
          
          const nameIndex = headers.findIndex(h => h.includes('nombre'));
          const formatIndex = headers.findIndex(h => h.includes('formato'));
          const stockIndex = headers.findIndex(h => h.includes('stock') || h.includes('cantidad'));
          const provIndex = headers.findIndex(h => h.includes('procedencia') || h.includes('origen'));
          // Optional: unit column if exists in excel, otherwise default
          const unitIndex = headers.findIndex(h => h.includes('unidad'));

          if (nameIndex === -1 || stockIndex === -1) {
              throw new Error("El archivo Excel debe contener al menos las columnas 'Nombre' y 'Stock'.");
          }

          // 3. Map Rows to Objects
          const extractedItems = rows.slice(1).map((row: any[]) => {
              const name = row[nameIndex] ? String(row[nameIndex]).trim() : '';
              if (!name) return null; // Skip empty rows

              return {
                  nombre_medicamento: name,
                  formato: formatIndex > -1 ? String(row[formatIndex] || '') : '',
                  cantidad_total: parseFloat(String(row[stockIndex] || 0)) || 0,
                  unidad: unitIndex > -1 ? String(row[unitIndex] || 'Comp') : 'Comp',
                  procedencia: provIndex > -1 ? String(row[provIndex] || 'Inventario Excel') : 'Inventario Excel',
                  fecha_adquisicion: new Date().toISOString()
              };
          }).filter(item => item !== null);

          if (extractedItems.length === 0) {
              throw new Error("No se encontraron medicamentos válidos en el archivo.");
          }

          // 4. Insert into Supabase (Upsert based on name + format)
          const { error: insError } = await supabase
            .from('farmacia_general_stock')
            .upsert(extractedItems, { onConflict: 'nombre_medicamento,formato' });
            
          if (insError) throw insError;
          
          alert(`✅ ¡Éxito! Se han importado ${extractedItems.length} medicamentos desde el archivo Excel.`);
          await fetchData();

      } catch (e: any) {
          console.error("Error al procesar Excel:", e);
          alert("❌ Error al procesar archivo: " + (e.message || "Verifique el formato del Excel."));
      } finally {
          setLoadingData(false);
      }
  }, [fetchData]);

  const handleSaveGeneralItem = useCallback(async (item: Omit<GeneralMedication, 'id'> | GeneralMedication) => {
    setLoadingData(true);
    try {
        const dbPayload: any = { 
            nombre_medicamento: item.nombre_medicamento, 
            formato: item.formato, 
            cantidad_total: parseFloat(String(item.cantidad_total)), 
            unidad: item.unidad, // INCLUIMOS LA UNIDAD AQUÍ
            procedencia: item.procedencia, 
            fecha_adquisicion: item.fecha_adquisicion || new Date().toISOString()
        };
        
        let error;
        if ('id' in item && item.id) {
            const { error: updateError } = await supabase.from('farmacia_general_stock').update(dbPayload).eq('id', item.id);
            error = updateError;
        } else {
            // REMOVED display_order logic
            const { error: insertError } = await supabase.from('farmacia_general_stock').insert([dbPayload]);
            error = insertError;
        }
        
        if (error) throw error;
        
        alert("✅ Ítem guardado con éxito.");
        await fetchData();
    } catch (e: any) {
        console.error("Error al guardar ítem en botiquín:", e);
        alert("❌ Error al guardar: " + (e.message || "Verifique los datos e intente nuevamente."));
    } finally {
        setLoadingData(false);
    }
  }, [fetchData]);

  const handleDeleteGeneralItem = useCallback(async (itemId: number) => {
      // Confirmation handled by Modal component
      setLoadingData(true);
      try {
          const { error } = await supabase.from('farmacia_general_stock').delete().eq('id', itemId);
          if (error) throw error;
          await fetchData();
      } catch (e: any) { 
          alert("❌ Error al eliminar ítem: " + e.message); 
      } finally {
          setLoadingData(false);
      }
  }, [fetchData]);

  const handleReorderGeneralItems = useCallback(async (reorderedItems: GeneralMedication[]) => {
      setGeneralKitItems(reorderedItems);
      // Removed display_order update because the column does not exist
  }, []);

  // --- RESIDENTS & MEDS ACTIONS ---
  const handleSelectResident = (resident: Resident) => { setSelectedResident(resident); setActivePanel(Panel.ResidentMedications); };
  const handleBackToResidents = () => { setSelectedResident(null); setActivePanel(Panel.Residents); };
  
  const handleForceDailyUpdate = useCallback(async () => {
    if (!window.confirm("¿Confirmar descuento de stock diario a todos los medicamentos activos ahora?")) return;
    setLoadingData(true);
    try {
        const { data: allMeds, error: fetchError } = await supabase.from('resident_medications').select('*');
        if (fetchError || !allMeds) throw fetchError;

        for (const m of allMeds) {
             let schedules = m.schedules;
             if (typeof schedules === 'string') try { schedules = JSON.parse(schedules); } catch(e) { schedules = []; }
             if (!Array.isArray(schedules)) schedules = [];

             const dailyExpense = schedules.reduce((sum, s) => sum + (parseFloat(String(s.quantity).replace(',', '.')) || 0), 0);

             if (dailyExpense > 0) {
                 const currentStock = parseFloat(m.stock) || 0;
                 const newStock = Number(Math.max(0, currentStock - dailyExpense).toFixed(2));
                 await supabase.from('resident_medications').update({ stock: newStock }).eq('id', m.id);
             }
        }
        alert("✅ Stock actualizado forzosamente.");
        await fetchData(); 
    } catch (e: any) { alert("Error: " + e.message); } finally { setLoadingData(false); }
  }, [fetchData]);

  const handleUpdateThreshold = useCallback(async (n: number) => { 
      setLowStockThreshold(n); 
      try {
          await supabase.from('app_settings').upsert({ key: 'low_stock_threshold', value: String(n) });
      } catch (e) {}
  }, []);
  
  const handleSaveResident = useCallback(async (data: any) => { 
    setLoadingData(true);
    try {
        const { error } = await supabase.from('residents').upsert({
            id: data.id || Date.now(),
            name: data.name,
            rut: data.rut,
            date_of_birth: data.dateOfBirth,
            display_order: data.displayOrder || 0
        } as any);
        if (error) throw error;
        await fetchData(); 
    } catch (e: any) { alert("Error: " + e.message); } finally { setLoadingData(false); }
  }, [fetchData]);

  const handleDeleteResident = useCallback(async (id: number) => { 
    // Confirmation handled by Modal component
    setLoadingData(true);
    try {
        await supabase.from('residents').delete().eq('id', id);
        await fetchData(); 
    } catch (e: any) { alert("Error: " + e.message); } finally { setLoadingData(false); }
  }, [fetchData]);

  const handleSaveMedication = useCallback(async (data: any) => { 
    setLoadingData(true);
    try {
        const { error } = await supabase.from('resident_medications').upsert({
            id: data.id || `RMED${Date.now()}`,
            resident_id: data.residentId,
            medication_name: data.medicationName,
            dose_value: data.doseValue,
            dose_unit: data.doseUnit,
            schedules: data.schedules,
            stock: data.stock,
            stock_unit: data.stockUnit,
            provenance: data.provenance,
            fecha_de_adquisicion: data.acquisitionDate,
            cantidad_de_adquisicion: data.acquisitionQuantity,
            delivery_date: data.deliveryDate,
            stock_updated_at: data.stockUpdatedAt || new Date().toISOString(),
            orden_personalizado: data.displayOrder || 0
        } as any);
        if (error) throw error;
        await fetchData(); 
    } catch (e: any) { alert("Error: " + e.message); } finally { setLoadingData(false); }
  }, [fetchData]);

  const handleDeleteMedication = useCallback(async (id: string) => { 
    // Confirmation handled by Modal component
    setLoadingData(true);
    try {
        await supabase.from('resident_medications').delete().eq('id', id);
        await fetchData(); 
    } catch (e: any) { alert("Error: " + e.message); } finally { setLoadingData(false); }
  }, [fetchData]);

  const handleSaveReport = useCallback(async (rep: any) => { 
    try {
        const { error } = await supabase.from('medical_reports').insert({
            id: rep.id, resident_id: rep.residentId, file_name: rep.fileName, file_data: rep.fileData, upload_date: rep.uploadDate
        } as any);
        if (error) throw error;
        await fetchData(); 
    } catch (e) { alert("Error al subir informe."); }
  }, [fetchData]);

  const handleDeleteReport = useCallback(async (id: string) => { 
    if (!window.confirm("¿Eliminar informe?")) return;
    try {
        const { error } = await supabase.from('medical_reports').delete().eq('id', id);
        if (error) throw error;
        await fetchData(); 
    } catch (e) { alert("Error al eliminar informe."); }
  }, [fetchData]);

  const handleRestoreData = useCallback(async () => {
    if (!window.confirm("¿Restaurar datos predeterminados de residentes?")) return;
    setLoadingData(true);
    try {
        const payload = MOCK_RESIDENTS.map(r => ({ id: r.id, name: r.name, rut: r.rut, date_of_birth: r.dateOfBirth, display_order: r.id }));
        const { error } = await supabase.from('residents').upsert(payload as any);
        if (error) throw error;
        await fetchData();
        alert("Restauración completa.");
    } catch (e: any) { alert("Error: " + e.message); } finally { setLoadingData(false); }
  }, [fetchData]);

  const renderPanel = () => {
    if (loadingData && activePanel !== Panel.AdminApp && residents.length === 0) {
         return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div></div>;
    }

    if (activePanel === Panel.ResidentMedications && selectedResident) {
      const residentMeds = residentMedications.filter(m => m.residentId === selectedResident.id);
      return <ResidentMedicationsPanel user={user} resident={selectedResident} onBack={handleBackToResidents} medications={residentMeds} onSaveMedication={handleSaveMedication} onDeleteMedication={handleDeleteMedication} onReorderMedications={()=>{}} medicalReports={medicalReports.filter(r => r.residentId === selectedResident.id)} onSaveReport={handleSaveReport} onDeleteReport={handleDeleteReport} lowStockThreshold={lowStockThreshold} />;
    }

    switch (activePanel) {
      case Panel.Dashboard: return <DashboardModern user={user} residents={residents} residentMedications={residentMedications} onNavigate={setActivePanel} lowStockThreshold={lowStockThreshold} onUpdateThreshold={handleUpdateThreshold} onForceDailyUpdate={handleForceDailyUpdate} />;
      case Panel.Residents: return <ResidentsPanel user={user} onSelectResident={handleSelectResident} residents={residents} onSaveResident={handleSaveResident} onDeleteResident={handleDeleteResident} onReorderResidents={()=>{}} />;
      case Panel.GeneralKit: return <GeneralKitPanel user={user} items={generalKitItems} onSaveItem={handleSaveGeneralItem} onDeleteItem={handleDeleteGeneralItem} onReorderItems={handleReorderGeneralItems} onImportList={handleImportGeneralKit} />;
      case Panel.GeneralInventory: return <GeneralInventoryPanel residentMedications={residentMedications} residents={residents} lowStockThreshold={lowStockThreshold} />;
      case Panel.SummaryCesfam: return <SummaryCesfamPanel residents={residents} residentMedications={residentMedications} lowStockThreshold={lowStockThreshold} onSelectResident={handleSelectResident} />;
      case Panel.SummaryIndividualStock: return <SummaryIndividualStockPanel residents={residents} residentMedications={residentMedications} onSelectResident={handleSelectResident} user={user} threshold={lowStockThreshold} />;
      case Panel.AdminApp: return <AdminAppPanel currentUser={user} users={users} onSaveUser={async (u: any) => {
        const { error } = await supabase.from('app_users').upsert({
            id: u.id || `user-${Date.now()}`, role: u.role, name: u.name, password: u.password, permissions: u.permissions, display_order: u.displayOrder || 0
        } as any);
        if (error) throw error;
        await onUsersMutated();
        await fetchData();
      }} onDeleteUser={async (id) => {
          const { error } = await supabase.from('app_users').delete().eq('id', id);
          if (error) throw error;
          await onUsersMutated();
          await fetchData();
      }} onReorderUsers={async(list) => {
          const payload = list.map((u, i) => ({ ...u, display_order: i }));
          await supabase.from('app_users').upsert(payload as any);
          await onUsersMutated();
          await fetchData();
      }} onRestoreData={handleRestoreData} onImportGeneralKit={() => {
        alert("Por favor utilice la carga desde el panel de Botiquín General.");
        return Promise.resolve();
      }} />;
      default: return <DashboardModern user={user} residents={residents} residentMedications={residentMedications} onNavigate={setActivePanel} lowStockThreshold={lowStockThreshold} onUpdateThreshold={handleUpdateThreshold} onForceDailyUpdate={handleForceDailyUpdate} />;
    }
  };

  // APP SHELL LAYOUT - CRITICAL FIX FOR MOBILE WIDTH
  // Using explicit flex directions and w-full/h-full to prevent "zoom out" effects on mobile.
  return (
    <div className="flex flex-col xl:flex-row h-full w-full bg-surface-ground font-sans text-slate-600 print:block overflow-hidden">
      
      {/* Sidebar Component: It handles its own fixed/relative state */}
      <Sidebar 
        user={user} 
        activePanel={activePanel} 
        setActivePanel={setActivePanel} 
        onLogout={onLogout} 
        availablePanels={availablePanels} 
        isMobileOpen={isSidebarOpen} 
        setIsMobileOpen={setIsSidebarOpen} 
      />

      {/* Main Content Area */}
      {/* flex-1 takes remaining space. min-w-0 prevents flex items from overflowing container */}
      <div className="flex-1 flex flex-col min-w-0 h-full w-full relative">
        
        {/* Mobile Header */}
        <header className="xl:hidden bg-white shadow-sm flex justify-between items-center p-4 sticky top-0 z-10 border-b border-slate-200 shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600"><MenuIcon className="w-6 h-6" /></button>
            <h1 className="text-lg font-bold text-slate-800 truncate px-2">{activePanel}</h1>
            <div className="w-6"></div>
        </header>

        {/* Scrollable Panel Area */}
        <main className="flex-1 overflow-y-auto p-3 xl:p-10 w-full custom-scrollbar">
          {renderPanel()}
        </main>
      </div>
      
      {isLogoutModalOpen && <ConfirmLogoutModal onConfirm={onLogout} onCancel={() => setIsLogoutModalOpen(false)} />}
    </div>
  );
};

export default MainLayout;