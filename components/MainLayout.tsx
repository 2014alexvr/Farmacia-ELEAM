

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
        const { data: residentsData, error: resError } = await supabase.from('residents').select('*').order('display_order', { ascending: true });
        if (residentsData) {
          const mappedResidents = residentsData.map((r: any) => ({
             id: r.id,
             name: r.name,
             rut: r.rut,
             dateOfBirth: r.date_of_birth,
             displayOrder: r.display_order
          }));
          setResidents(mappedResidents);
        } else if (resError) {
             console.warn("Error fetching residents with sort, trying basic select:", resError.message);
             const { data: retryData } = await supabase.from('residents').select('*');
             if (retryData) {
                const mapped = retryData.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    rut: r.rut,
                    dateOfBirth: r.date_of_birth,
                    displayOrder: r.display_order
                })).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                setResidents(mapped);
             } else {
                 if (residents.length === 0) setResidents(MOCK_RESIDENTS); 
             }
        }

        // Fetch Medications & Calculate Virtual Stock (Read-Only Logic)
        const { data: medsData, error: medsError } = await supabase.from('resident_medications').select('*');
        if (medsData) {
            const mappedMeds = medsData.map((m: any) => {
                // 1. Get Base Stock (Initial Entry)
                const baseStock = m.stock;
                
                // 2. Determine Reference Date (Start of Treatment/Entry)
                // If stock_updated_at is null, we assume the medication was just created or legacy data (use today to avoid huge deductions)
                const anchorDateStr = m.stock_updated_at || new Date().toISOString();
                const anchorDate = new Date(anchorDateStr);
                const today = new Date();
                
                // Normalize to midnight to count full days passed
                anchorDate.setHours(0,0,0,0);
                today.setHours(0,0,0,0);

                // 3. Calculate Days Elapsed
                // Difference in milliseconds
                const diffTime = today.getTime() - anchorDate.getTime();
                // Convert to days (floor ensures we don't deduct for the current partial day if desired, or use Math.max(0, ...))
                const daysElapsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

                // 4. Calculate Daily Consumption
                const dailyExpense = m.schedules ? m.schedules.reduce((sum: number, s: any) => sum + (Number(s.quantity) || 0), 0) : 0;

                // 5. Calculate Virtual Stock
                // Virtual Stock = Base Stock - (Daily Consumption * Days Elapsed)
                const consumed = dailyExpense * daysElapsed;
                const virtualStock = Math.max(0, baseStock - consumed); // Prevent negative visual stock

                return {
                    id: m.id,
                    resident_id: m.resident_id,
                    residentId: m.resident_id,
                    medicationName: m.medication_name,
                    doseValue: m.dose_value,
                    doseUnit: m.dose_unit,
                    schedules: m.schedules,
                    stock: virtualStock, // UI sees the Calculated Virtual Stock
                    stockUnit: m.stock_unit,
                    provenance: m.provenance,
                    acquisitionDate: m.acquisition_date,
                    acquisitionQuantity: m.acquisition_quantity,
                    deliveryDate: m.delivery_date,
                    stockUpdatedAt: m.stock_updated_at // Keep track of the reference date
                };
            });
            setResidentMedications(mappedMeds);
        } else if (medsError) {
             console.error("Error fetching medications", medsError.message);
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

      } catch (error: any) {
        console.error("Error loading data from Supabase", error.message || error);
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
        const isNew = !('id' in residentData);

        if (isNew) {
             // Calculate new order
             const maxOrder = residents.length > 0 ? Math.max(...residents.map(r => r.displayOrder || 0)) : 0;
             residentToSave = { ...residentData, id: Date.now(), displayOrder: maxOrder + 1 }; 
        } else {
            residentToSave = residentData as Resident;
        }

        // Optimistic Update
        setResidents(prev => {
            if (isNew) {
                return [...prev, residentToSave];
            } else {
                return prev.map(r => r.id === residentToSave.id ? residentToSave : r);
            }
        });

        const basePayload = {
            id: residentToSave.id,
            name: residentToSave.name,
            rut: residentToSave.rut,
            date_of_birth: residentToSave.dateOfBirth,
        };

        // Try with display_order first
        const { error } = await supabase.from('residents').upsert({
            ...basePayload,
            display_order: residentToSave.displayOrder ?? 0
        });

        if (error) {
             // Retry without display_order if it fails (e.g. column missing)
             console.warn("Error saving resident with order, retrying basic:", error.message);
             const { error: retryError } = await supabase.from('residents').upsert(basePayload);
             if (retryError) throw retryError;
        }

    } catch (e: any) {
        console.error("Error saving resident:", e.message || e);
        alert("Error al guardar residente: " + (e.message || "Error desconocido"));
    }
  }, [residents]);

  const handleDeleteResident = useCallback(async (residentId: number) => {
    try {
        const { error } = await supabase.from('residents').delete().eq('id', residentId);
        if (error) throw error;

        setResidents(prev => prev.filter(r => r.id !== residentId));
        setResidentMedications(prev => prev.filter(m => m.residentId !== residentId));
        setMedicalReports(prev => prev.filter(r => r.residentId !== residentId));
    } catch (e: any) {
        console.error("Error deleting resident:", e.message || e);
        alert("Error al eliminar residente.");
    }
  }, []);

  const handleReorderResidents = useCallback(async (reorderedResidents: Resident[]) => {
      // Optimistic update
      setResidents(reorderedResidents);

      try {
          const upsertPayload = reorderedResidents.map((r, index) => ({
              id: r.id,
              name: r.name,
              rut: r.rut,
              date_of_birth: r.dateOfBirth,
              display_order: index
          }));

          const { error } = await supabase.from('residents').upsert(upsertPayload);
          if (error) throw error;
          
      } catch (e: any) {
          console.warn("Error reordering residents (likely missing column):", e.message || e);
      }
  }, []);

  // --- Medications CRUD ---
  const handleSaveMedication = useCallback(async (medicationData: Omit<ResidentMedication, 'id' | 'residentId'> | ResidentMedication) => {
    try {
        let medToSave: ResidentMedication;
        
        // This is a "Save" action, so we are resetting the reference date (Fecha de Ingreso/Actualización) to NOW.
        const nowISO = new Date().toISOString();

        if ('id' in medicationData) {
            medToSave = { 
                ...medicationData, 
                stockUpdatedAt: nowISO // Reset anchor date on edit
            } as ResidentMedication;
        } else {
            if (!selectedResident) return;
            medToSave = { 
                ...medicationData, 
                id: `RMED${Date.now()}`, 
                residentId: selectedResident.id,
                stockUpdatedAt: nowISO // Set initial anchor date
            };
        }

        // Base payload (fields that are guaranteed to exist)
        const basePayload = {
            id: medToSave.id,
            resident_id: medToSave.residentId,
            medication_name: medToSave.medicationName,
            dose_value: medToSave.doseValue,
            dose_unit: medToSave.doseUnit,
            schedules: medToSave.schedules,
            stock: medToSave.stock, // Saving the INPUT stock as the new base
            stock_unit: medToSave.stockUnit,
            provenance: medToSave.provenance,
            delivery_date: medToSave.deliveryDate,
        };

        // Full payload (including new columns that might not exist yet)
        const fullPayload = {
            ...basePayload,
            acquisition_date: medToSave.acquisitionDate,
            acquisition_quantity: medToSave.acquisitionQuantity,
            stock_updated_at: medToSave.stockUpdatedAt
        };

        // Try upserting with ALL fields first
        const { error } = await supabase.from('resident_medications').upsert(fullPayload);
        
        if (error) {
            // Check if error is related to missing columns/schema
            // PGRST204 is often used for column not found, but we check message too
            if (error.message.includes('column') || error.code === '42703' || error.message.includes('schema cache') || error.code === 'PGRST204') {
                 console.warn("Schema mismatch detected (missing columns). Retrying with base payload.", error.message);
                 // Fallback: save without the new columns
                 const { error: retryError } = await supabase.from('resident_medications').upsert(basePayload);
                 if (retryError) throw retryError;
            } else {
                throw error;
            }
        }

        setResidentMedications(prev => {
             if ('id' in medicationData) {
                 return prev.map(m => m.id === medicationData.id ? medToSave : m);
             } else {
                 return [...prev, medToSave];
             }
        });

    } catch (e: any) {
        console.error("Error saving medication:", e.message || e);
        alert("Error al guardar medicamento: " + (e.message || "Error desconocido"));
    }
  }, [selectedResident]);

  const handleDeleteMedication = useCallback(async (medicationId: string) => {
    try {
        const { error } = await supabase.from('resident_medications').delete().eq('id', medicationId);
        if (error) throw error;
        setResidentMedications(prev => prev.filter(m => m.id !== medicationId));
    } catch (e: any) {
        console.error("Error deleting medication:", e.message || e);
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
    } catch (e: any) {
        console.error("Error saving report:", e.message || e);
        alert("Error al subir informe.");
    }
  }, []);

  const handleDeleteReport = useCallback(async (reportId: string) => {
    try {
        const { error } = await supabase.from('medical_reports').delete().eq('id', reportId);
        if (error) throw error;
        setMedicalReports(prev => prev.filter(r => r.id !== reportId));
    } catch (e: any) {
        console.error("Error deleting report:", e.message || e);
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

        const basePayload = {
            id: userToSave.id,
            role: userToSave.role,
            name: userToSave.name,
            password: userToSave.password,
            permissions: userToSave.permissions,
        };

        // Attempt with display_order first
        const { error } = await supabase.from('app_users').upsert({
            ...basePayload,
            display_order: userToSave.displayOrder ?? 0
        });

        if (error) {
            // If error (likely missing column), try without it
            console.warn("Error saving user with display_order, retrying without...", error.message);
            const { error: retryError } = await supabase.from('app_users').upsert(basePayload);
            if (retryError) throw retryError;
        }
        
    } catch (e: any) {
        console.error("Error saving user:", e.message || e);
        alert("Error al guardar usuario: " + (e.message || "Error desconocido"));
    }
  }, [users, setUsers]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
        // Optimistic Delete
        setUsers(prev => prev.filter(u => u.id !== userId));

        const { error } = await supabase.from('app_users').delete().eq('id', userId);
        if (error) throw error;
        
    } catch (e: any) {
        console.error("Error deleting user:", e.message || e);
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
              display_order: index
          }));

          const { error } = await supabase.from('app_users').upsert(upsertPayload);
          if (error) throw error;
          
      } catch (e: any) {
          console.warn("Error reordering users (likely missing column 'display_order'):", e.message || e);
          // Not critical enough to alert user and block UI, just log warning
      }
  }, [setUsers]);

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
        return <ResidentsPanel user={user} onSelectResident={handleSelectResident} residents={residents} onSaveResident={handleSaveResident} onDeleteResident={handleDeleteResident} onReorderResidents={handleReorderResidents} />;
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