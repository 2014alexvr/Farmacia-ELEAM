import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { User, Panel, Resident, ResidentMedication, ManagedUser, MedicalReport } from '../types';
import { ROLE_PANELS, MOCK_RESIDENTS, MOCK_RESIDENT_MEDICATIONS } from '../constants';
import Sidebar from './Sidebar';
import DashboardModern from './panels/DashboardModern';
import { ResidentsPanel } from './panels/ResidentsPanel';
import MedicationsPanel from './panels/MedicationsPanel';
import SummaryCesfamPanel from './panels/SummaryCesfamPanel';
import SummaryIndividualStockPanel from './panels/SummaryIndividualStockPanel';
import ResidentMedicationsPanel from './panels/ResidentMedicationsPanel';
import SummaryMentalHealthPanel from './panels/SummaryMentalHealthPanel';
import SummaryFamilyPanel from './panels/SummaryFamilyPanel';
import SummaryPurchasesPanel from './panels/SummaryPurchasesPanel';
import ConfirmLogoutModal from './panels/ConfirmLogoutModal';
import MenuIcon from './icons/MenuIcon';
import AdminAppPanel from './panels/AdminAppPanel';
import GeneralInventoryPanel from './panels/GeneralInventoryPanel';
import { supabase } from '../supabaseClient';

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
  
  // GLOBAL SETTING: Low Stock Threshold (default 7 days)
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(7);

  // Initial Data Fetch from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch Settings
        const { data: settingsData } = await supabase.from('app_settings').select('value').eq('key', 'low_stock_threshold').single();
        if (settingsData && settingsData.value) {
            setLowStockThreshold(parseInt(settingsData.value, 10));
        }

        // Fetch Residents
        const { data: residentsData, error: resError } = await supabase.from('residents').select('*');
        if (residentsData) {
          const mappedResidents = residentsData.map((r: any) => ({
             id: r.id,
             name: r.name,
             rut: r.rut,
             dateOfBirth: r.date_of_birth
          }));
          setResidents(mappedResidents);
        } else if (resError) {
             console.error("Error fetching residents", resError);
             if (residents.length === 0) setResidents(MOCK_RESIDENTS); 
        }

        // Fetch Medications
        const { data: medsData, error: medsError } = await supabase.from('resident_medications').select('*');
        if (medsData) {
            const mappedMeds = medsData.map((m: any) => ({
                id: m.id,
                resident_id: m.resident_id, // keep for ref
                residentId: m.resident_id,
                medicationName: m.medication_name,
                doseValue: m.dose_value,
                doseUnit: m.dose_unit,
                schedules: m.schedules,
                stock: m.stock,
                stockUnit: m.stock_unit,
                provenance: m.provenance,
                deliveryDate: m.delivery_date
            }));
            setResidentMedications(mappedMeds);
        } else if (medsError) {
             console.error("Error fetching medications", medsError);
             if (residentMedications.length === 0) setResidentMedications(MOCK_RESIDENT_MEDICATIONS);
        }

        // Fetch Reports
        const { data: reportsData } = await supabase.from('medical_reports').select('*');
        if (reportsData) {
            const mappedReports = reportsData.map((r: any) => ({
                id: r.id,
                residentId: r.resident_id,
                fileName: r.file_name,
                fileData: r.file_data,
                uploadDate: r.upload_date
            }));
            setMedicalReports(mappedReports);
        }

      } catch (error) {
        console.error("Error loading data from Supabase", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateThreshold = async (newThreshold: number) => {
    setLowStockThreshold(newThreshold);
    try {
        await supabase.from('app_settings').upsert({ key: 'low_stock_threshold', value: String(newThreshold) });
    } catch(e) {
        console.error("Error saving setting", e);
    }
  };

  const handleSelectResident = (resident: Resident) => { setSelectedResident(resident); setActivePanel(Panel.ResidentMedications); };
  const handleBackToResidents = () => { setSelectedResident(null); setActivePanel(Panel.Residents); };

  // --- Residents CRUD ---
  const handleSaveResident = useCallback(async (residentData: Omit<Resident, 'id'> | Resident) => {
    try {
        let residentToSave: Resident;
        if ('id' in residentData) {
            residentToSave = residentData;
        } else {
            residentToSave = { ...residentData, id: Date.now() }; 
        }

        const dbPayload = {
            id: residentToSave.id,
            name: residentToSave.name,
            rut: residentToSave.rut,
            date_of_birth: residentToSave.dateOfBirth
        };

        const { error } = await supabase.from('residents').upsert(dbPayload);
        if (error) throw error;

        setResidents(prev => {
            if ('id' in residentData) {
                return prev.map(r => r.id === residentData.id ? residentData : r);
            } else {
                return [...prev, residentToSave];
            }
        });
    } catch (e) {
        console.error("Error saving resident:", e);
        alert("Error al guardar residente en la base de datos.");
    }
  }, []);

  const handleDeleteResident = useCallback(async (residentId: number) => {
    try {
        const { error } = await supabase.from('residents').delete().eq('id', residentId);
        if (error) throw error;

        setResidents(prev => prev.filter(r => r.id !== residentId));
        setResidentMedications(prev => prev.filter(m => m.residentId !== residentId));
        setMedicalReports(prev => prev.filter(r => r.residentId !== residentId));
    } catch (e) {
        console.error("Error deleting resident:", e);
        alert("Error al eliminar residente.");
    }
  }, []);

  // --- Medications CRUD ---
  const handleSaveMedication = useCallback(async (medicationData: Omit<ResidentMedication, 'id' | 'residentId'> | ResidentMedication) => {
    try {
        let medToSave: ResidentMedication;
        
        if ('id' in medicationData) {
            medToSave = medicationData as ResidentMedication;
        } else {
            if (!selectedResident) return;
            medToSave = { 
                ...medicationData, 
                id: `RMED${Date.now()}`, 
                residentId: selectedResident.id, 
            };
        }

        const dbPayload = {
            id: medToSave.id,
            resident_id: medToSave.residentId,
            medication_name: medToSave.medicationName,
            dose_value: medToSave.doseValue,
            dose_unit: medToSave.doseUnit,
            schedules: medToSave.schedules,
            stock: medToSave.stock,
            stock_unit: medToSave.stockUnit,
            provenance: medToSave.provenance,
            delivery_date: medToSave.deliveryDate
        };

        const { error } = await supabase.from('resident_medications').upsert(dbPayload);
        if (error) throw error;

        setResidentMedications(prev => {
             if ('id' in medicationData) {
                 return prev.map(m => m.id === medicationData.id ? medToSave : m);
             } else {
                 return [...prev, medToSave];
             }
        });

    } catch (e) {
        console.error("Error saving medication:", e);
        alert("Error al guardar medicamento.");
    }
  }, [selectedResident]);

  const handleDeleteMedication = useCallback(async (medicationId: string) => {
    try {
        const { error } = await supabase.from('resident_medications').delete().eq('id', medicationId);
        if (error) throw error;
        setResidentMedications(prev => prev.filter(m => m.id !== medicationId));
    } catch (e) {
        console.error("Error deleting medication:", e);
        alert("Error al eliminar medicamento.");
    }
  }, []);

  // --- Reports CRUD ---
  const handleSaveReport = useCallback(async (report: MedicalReport) => {
    try {
        const dbPayload = {
            id: report.id,
            resident_id: report.residentId,
            file_name: report.fileName,
            file_data: report.fileData,
            upload_date: report.uploadDate
        };

        const { error } = await supabase.from('medical_reports').insert(dbPayload);
        if (error) throw error;

        setMedicalReports(prev => [report, ...prev]);
    } catch (e) {
        console.error("Error saving report:", e);
        alert("Error al subir informe.");
    }
  }, []);

  const handleDeleteReport = useCallback(async (reportId: string) => {
    try {
        const { error } = await supabase.from('medical_reports').delete().eq('id', reportId);
        if (error) throw error;
        setMedicalReports(prev => prev.filter(r => r.id !== reportId));
    } catch (e) {
        console.error("Error deleting report:", e);
        alert("Error al eliminar informe.");
    }
  }, []);

  // --- Users CRUD & Reordering ---
  const handleSaveUser = useCallback(async (userData: Omit<ManagedUser, 'id'> | ManagedUser) => {
    try {
        let userToSave: ManagedUser;
        const isNew = !('id' in userData);

        if (!isNew) {
            userToSave = userData as ManagedUser;
        } else {
            // Assign a default display order (end of list)
            const maxOrder = users.length > 0 ? Math.max(...users.map(u => u.displayOrder || 0)) : 0;
            userToSave = { ...userData, id: `user-${Date.now()}`, displayOrder: maxOrder + 1 };
        }

        // 1. OPTIMISTIC UI UPDATE: Update local state immediately
        setUsers(prevUsers => {
            if (isNew) {
                return [...prevUsers, userToSave];
            } else {
                return prevUsers.map(u => u.id === userToSave.id ? userToSave : u);
            }
        });

        const dbPayload = {
            id: userToSave.id,
            role: userToSave.role,
            name: userToSave.name,
            password: userToSave.password,
            permissions: userToSave.permissions,
            display_order: userToSave.displayOrder ?? 0
        };

        const { error } = await supabase.from('app_users').upsert(dbPayload);
        if (error) throw error;

        // We don't await onUsersMutated() here to avoid overriding the optimistic update 
        // if the DB fetch is slower or fails.
        
    } catch (e) {
        console.error("Error saving user:", e);
        alert("Error al guardar usuario.");
    }
  }, [users, setUsers]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
        // Optimistic Delete
        setUsers(prev => prev.filter(u => u.id !== userId));

        const { error } = await supabase.from('app_users').delete().eq('id', userId);
        if (error) throw error;
        
    } catch (e) {
        console.error("Error deleting user:", e);
        alert("Error al eliminar usuario.");
        await onUsersMutated(); // Revert if failed
    }
  }, [setUsers, onUsersMutated]);

  const handleReorderUsers = useCallback(async (reorderedUsers: ManagedUser[]) => {
      // Optimistic update
      setUsers(reorderedUsers);

      try {
          // Prepare bulk upsert payload
          const upsertPayload = reorderedUsers.map((u, index) => ({
              id: u.id,
              role: u.role,
              name: u.name,
              password: u.password,
              permissions: u.permissions,
              display_order: index // Explicitly set order based on array index
          }));

          const { error } = await supabase.from('app_users').upsert(upsertPayload);
          if (error) throw error;
          
      } catch (e) {
          console.error("Error reordering users:", e);
          alert("Error al guardar el orden de los usuarios.");
          await onUsersMutated(); // Revert if failed
      }
  }, [setUsers, onUsersMutated]);

  const handleLogoutClick = () => { setIsLogoutModalOpen(true); };
  const handleConfirmLogout = () => { setIsLogoutModalOpen(false); onLogout(); };

  const renderPanel = () => {
    if (loadingData && activePanel !== Panel.AdminApp) {
         return (
             <div className="flex h-full items-center justify-center">
                 <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-slate-400">Cargando datos...</p>
                 </div>
             </div>
         )
    }

    if (activePanel === Panel.ResidentMedications && selectedResident) {
      return (
        <ResidentMedicationsPanel
          user={user}
          resident={selectedResident}
          onBack={handleBackToResidents}
          medications={residentMedications.filter(m => m.residentId === selectedResident.id)}
          onSaveMedication={handleSaveMedication}
          onDeleteMedication={handleDeleteMedication}
          medicalReports={medicalReports.filter(r => r.residentId === selectedResident.id)}
          onSaveReport={handleSaveReport}
          onDeleteReport={handleDeleteReport}
          lowStockThreshold={lowStockThreshold}
        />
      );
    }

    switch (activePanel) {
      case Panel.Dashboard:
        return (
          <DashboardModern 
            user={user} 
            residents={residents} 
            residentMedications={residentMedications} 
            onNavigate={setActivePanel}
            lowStockThreshold={lowStockThreshold}
            onUpdateThreshold={handleUpdateThreshold}
          />
        );
      case Panel.Residents:
        return <ResidentsPanel user={user} onSelectResident={handleSelectResident} residents={residents} onSaveResident={handleSaveResident} onDeleteResident={handleDeleteResident} />;
      case Panel.Medications: return <MedicationsPanel />;
      case Panel.GeneralInventory: 
        return (
          <GeneralInventoryPanel 
            residentMedications={residentMedications} 
            residents={residents} 
            lowStockThreshold={lowStockThreshold}
          />
        );
      case Panel.SummaryCesfam: 
        return (
          <SummaryCesfamPanel 
            residents={residents} 
            residentMedications={residentMedications}
            lowStockThreshold={lowStockThreshold}
          />
        );
      case Panel.SummaryIndividualStock: 
        return <SummaryIndividualStockPanel 
                  residents={residents} 
                  residentMedications={residentMedications} 
                  onSelectResident={handleSelectResident} 
                  user={user}
                  threshold={lowStockThreshold}
               />;
      case Panel.SummaryMentalHealth: return <SummaryMentalHealthPanel />;
      case Panel.SummaryFamily: return <SummaryFamilyPanel />;
      case Panel.SummaryPurchases: return <SummaryPurchasesPanel />;
      case Panel.AdminApp: 
        return <AdminAppPanel 
                  currentUser={user} 
                  users={users} 
                  onSaveUser={handleSaveUser} 
                  onDeleteUser={handleDeleteUser}
                  onReorderUsers={handleReorderUsers}
               />;
      default: 
        return (
          <DashboardModern 
            user={user} 
            residents={residents} 
            residentMedications={residentMedications} 
            onNavigate={setActivePanel}
            lowStockThreshold={lowStockThreshold}
            onUpdateThreshold={handleUpdateThreshold}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen md:flex bg-surface-ground font-sans text-slate-600 print:block print:bg-white print:overflow-visible print:h-auto">
      <Sidebar user={user} activePanel={activePanel} setActivePanel={setActivePanel} onLogout={handleLogoutClick} availablePanels={availablePanels} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col w-full md:w-auto print:block print:w-full print:static">
        <header className="md:hidden bg-white shadow-sm flex justify-between items-center p-4 sticky top-0 z-10 border-b border-slate-200 print:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 hover:text-brand-primary"><MenuIcon className="w-6 h-6" /></button>
            <h1 className="text-lg font-bold text-slate-800">{activePanel}</h1>
            <div className="w-6"></div>
        </header>
        <main className="flex-1 p-6 md:p-10 overflow-y-auto print:overflow-visible print:h-auto print:p-0 print:w-full print:static print:block">
          {renderPanel()}
        </main>
      </div>
      {isLogoutModalOpen && <ConfirmLogoutModal onConfirm={handleConfirmLogout} onCancel={() => setIsLogoutModalOpen(false)} />}
    </div>
  );
};

export default MainLayout;