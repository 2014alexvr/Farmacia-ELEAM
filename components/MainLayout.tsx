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

  // --- CORE LOGIC: STOCK DEDUCTION (CATCH-UP) ---
  const processStockCatchUp = async (medications: any[]) => {
      const updates = [];
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD for simple comparison

      for (const m of medications) {
          // If no update date, assume it's new and set anchor to now without deducting
          if (!m.stock_updated_at) continue;

          const lastUpdateDate = new Date(m.stock_updated_at);
          
          // Calculate difference in days (ignoring time, strictly dates)
          // Normalize to midnight UTC to avoid timezone shifts causing issues
          const d1 = Date.UTC(lastUpdateDate.getFullYear(), lastUpdateDate.getMonth(), lastUpdateDate.getDate());
          const d2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
          const msPerDay = 1000 * 60 * 60 * 24;
          const daysElapsed = Math.floor((d2 - d1) / msPerDay);

          if (daysElapsed >= 1) {
             // Calculate Daily Dose
             const dailyExpense = m.schedules ? m.schedules.reduce((sum: number, s: any) => sum + (Number(s.quantity) || 0), 0) : 0;
             
             if (dailyExpense > 0) {
                 const totalDeduction = dailyExpense * daysElapsed;
                 const newStock = Math.max(0, m.stock - totalDeduction);
                 
                 console.log(`[STOCK UPDATE] ${m.medication_name}: Descontando ${totalDeduction} (${daysElapsed} días). Nuevo Stock: ${newStock}`);

                 updates.push({
                     id: m.id,
                     stock: newStock,
                     stock_updated_at: now.toISOString() // Reset anchor to now
                 });
             }
          }
      }

      if (updates.length > 0) {
          for (const update of updates) {
              await supabase.from('resident_medications')
                  .update({ stock: update.stock, stock_updated_at: update.stock_updated_at })
                  .eq('id', update.id);
          }
          return true; // Data changed
      }
      return false; // No changes
  };

  // Función centralizada para cargar datos
  const fetchData = useCallback(async () => {
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

        // Fetch Medications raw first
        const { data: medsDataRaw, error: medsError } = await supabase.from('resident_medications').select('*');

        if (medsDataRaw) {
            // RUN STOCK CATCH-UP LOGIC BEFORE DISPLAYING
            // This ensures if the user hasn't opened the app in 3 days, 3 days are deducted DB-side.
            const dataChanged = await processStockCatchUp(medsDataRaw);
            
            let finalMedsData = medsDataRaw;
            if (dataChanged) {
                 // Refetch if we updated the DB
                 const { data: refreshedMeds } = await supabase.from('resident_medications').select('*');
                 if (refreshedMeds) finalMedsData = refreshedMeds;
            }

            const mappedMeds = finalMedsData.map((m: any) => {
                return {
                    id: m.id,
                    resident_id: m.resident_id,
                    residentId: m.resident_id,
                    medicationName: m.medication_name,
                    doseValue: m.dose_value,
                    doseUnit: m.dose_unit,
                    schedules: m.schedules,
                    stock: m.stock, // Show REAL DB stock
                    stockUnit: m.stock_unit,
                    provenance: m.provenance,
                    acquisitionDate: m.acquisition_date,
                    acquisitionQuantity: m.acquisition_quantity,
                    deliveryDate: m.delivery_date,
                    stockUpdatedAt: m.stock_updated_at,
                    displayOrder: m.orden_personalizado || 0
                };
            });
            // Client-side sort as fallback
            mappedMeds.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
            setResidentMedications(mappedMeds);
        } else if (medsError) {
             console.error("Error fetching medications", medsError.message);
             if (residentMedications.length === 0) setResidentMedications([]);
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
  }, [residents.length, residentMedications.length]); 
  
  // Initial Data Fetch from Supabase
  useEffect(() => {
    fetchData();
  }, []); 

  // --- MANUAL FORCE UPDATE FUNCTION (THE SOLUTION TO THE 24H WAIT) ---
  const handleForceDailyUpdate = useCallback(async () => {
    if (!window.confirm("¿CONFIRMAS descontar manualmente 1 día de dosis a TODOS los medicamentos? Esta acción reducirá el stock real en la base de datos inmediatamente.")) return;
    
    setLoadingData(true);
    try {
        const { data: allMeds } = await supabase.from('resident_medications').select('*');
        if (!allMeds) throw new Error("No se pudieron cargar los medicamentos.");

        let processedCount = 0;
        for (const m of allMeds) {
             const dailyExpense = m.schedules ? m.schedules.reduce((sum: number, s: any) => sum + (Number(s.quantity) || 0), 0) : 0;
             if (dailyExpense > 0) {
                 const newStock = Math.max(0, m.stock - dailyExpense);
                 await supabase.from('resident_medications')
                    .update({ 
                        stock: newStock,
                        stock_updated_at: new Date().toISOString() // Update timestamp so auto-logic doesn't run again today
                    })
                    .eq('id', m.id);
                 processedCount++;
             }
        }
        alert(`Proceso completado. Se descontó 1 día de consumo a ${processedCount} medicamentos.`);
        fetchData(); // Reload UI
    } catch (e: any) {
        console.error("Error forcing update:", e);
        alert("Error al procesar: " + e.message);
    } finally {
        setLoadingData(false);
    }
  }, [fetchData]);


  const handleUpdateThreshold = async (newThreshold: number) => {
    setLowStockThreshold(newThreshold);
    try {
        await supabase.from('app_settings').upsert({ key: 'low_stock_threshold', value: String(newThreshold) });
    } catch(e) {
        console.error("Error saving setting", e);
    }
  };

  // --- RESTORE DATA FUNCTIONALITY ---
  const handleRestoreData = useCallback(async () => {
    if (!window.confirm("¿Estás seguro de que deseas restaurar los datos iniciales? Se recuperarán los residentes y medicamentos predeterminados.")) return;

    setLoadingData(true);
    try {
        // 1. Restore Residents
        const residentsPayload = MOCK_RESIDENTS.map(r => ({
            id: r.id,
            name: r.name,
            rut: r.rut,
            date_of_birth: r.dateOfBirth,
            display_order: r.id 
        }));
        
        const { error: resError } = await supabase.from('residents').upsert(residentsPayload);
        if (resError) throw resError;

        // 2. Restore Medications
        const medsPayload = MOCK_RESIDENT_MEDICATIONS.map((m, index) => ({
            id: m.id,
            resident_id: m.residentId,
            medication_name: m.medicationName,
            dose_value: m.doseValue,
            dose_unit: m.doseUnit,
            schedules: m.schedules,
            stock: m.stock,
            stock_unit: m.stockUnit,
            provenance: m.provenance,
            delivery_date: m.deliveryDate,
            stock_updated_at: new Date().toISOString()
            // Not including 'orden_personalizado' to avoid errors if column is missing
        }));

        const { error: medError } = await supabase.from('resident_medications').upsert(medsPayload);
        if (medError) throw medError;

        alert("Restauración completada correctamente.");
        fetchData(); // Reload data

    } catch (e: any) {
        console.error("Error restoring data:", e);
        alert("Ocurrió un error durante la restauración: " + (e.message || e));
    } finally {
        setLoadingData(false);
    }
  }, [fetchData]);


  const handleSelectResident = (resident: Resident) => { setSelectedResident(resident); setActivePanel(Panel.ResidentMedications); };
  const handleBackToResidents = () => { setSelectedResident(null); setActivePanel(Panel.Residents); };

  // --- Residents CRUD ---
  const handleSaveResident = useCallback(async (residentData: Omit<Resident, 'id'> | Resident) => {
    try {
        let residentToSave: Resident;
        const isNew = !('id' in residentData);

        if (isNew) {
             const maxOrder = residents.length > 0 ? Math.max(...residents.map(r => r.displayOrder || 0)) : 0;
             residentToSave = { ...residentData, id: Date.now(), displayOrder: maxOrder + 1 }; 
        } else {
            residentToSave = residentData as Resident;
        }

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

        const { error } = await supabase.from('residents').upsert({
            ...basePayload,
            display_order: residentToSave.displayOrder ?? 0
        });

        if (error) {
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
          console.warn("Error reordering residents:", e.message || e);
      }
  }, []);

  // --- Medications CRUD ---
  const handleSaveMedication = useCallback(async (medicationData: Omit<ResidentMedication, 'id' | 'residentId'> | ResidentMedication) => {
    try {
        let medToSave: ResidentMedication;
        const nowISO = new Date().toISOString();
        const stockUpdatedAt = (medicationData as any).stockUpdatedAt || nowISO;

        if ('id' in medicationData) {
            medToSave = { 
                ...medicationData, 
                stockUpdatedAt: stockUpdatedAt
            } as ResidentMedication;
        } else {
            if (!selectedResident) return;
            
            // Calculate Order
            const currentResidentMeds = residentMedications.filter(m => m.residentId === selectedResident.id);
            const maxOrder = currentResidentMeds.length > 0 
                ? Math.max(...currentResidentMeds.map(m => m.displayOrder || 0)) 
                : 0;

            medToSave = { 
                ...medicationData, 
                id: `RMED${Date.now()}`, 
                residentId: selectedResident.id,
                stockUpdatedAt: stockUpdatedAt,
                displayOrder: maxOrder + 1
            };
        }

        const basePayload = {
            id: medToSave.id,
            resident_id: medToSave.residentId,
            medication_name: medToSave.medicationName,
            dose_value: medToSave.doseValue,
            dose_unit: medToSave.doseUnit,
            schedules: medToSave.schedules,
            stock: medToSave.stock,
            stock_unit: medToSave.stockUnit,
            provenance: medToSave.provenance,
            delivery_date: medToSave.deliveryDate,
        };

        const fullPayload = {
            ...basePayload,
            acquisition_date: medToSave.acquisitionDate,
            acquisition_quantity: medToSave.acquisitionQuantity,
            stock_updated_at: medToSave.stockUpdatedAt,
            orden_personalizado: medToSave.displayOrder ?? 0 // Use custom column
        };

        const { error } = await supabase.from('resident_medications').upsert(fullPayload);
        
        if (error) {
            if (error.message.includes('column') || error.code === '42703') {
                 console.warn("Schema mismatch. Retrying base.", error.message);
                 const { error: retryError } = await supabase.from('resident_medications').upsert(basePayload);
                 if (retryError) throw retryError;
            } else {
                throw error;
            }
        }

        fetchData(); 

    } catch (e: any) {
        console.error("Error saving medication:", e.message || e);
        alert("Error al guardar medicamento: " + (e.message || "Error desconocido"));
    }
  }, [selectedResident, residentMedications, fetchData]);

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

  const handleReorderMedications = useCallback(async (reorderedMeds: ResidentMedication[]) => {
      setResidentMedications(prev => {
          const residentId = reorderedMeds[0]?.residentId;
          if (!residentId) return prev;
          const otherMeds = prev.filter(m => m.residentId !== residentId);
          const updatedMeds = reorderedMeds.map((m, idx) => ({ ...m, displayOrder: idx }));
          return [...otherMeds, ...updatedMeds];
      });

      try {
          const upsertPayload = reorderedMeds.map((m, index) => ({
              id: m.id,
              resident_id: m.residentId,
              medication_name: m.medicationName,
              dose_value: m.doseValue,
              dose_unit: m.doseUnit,
              schedules: m.schedules,
              stock: m.stock, 
              stock_unit: m.stockUnit,
              provenance: m.provenance,
              delivery_date: m.deliveryDate,
              acquisition_date: m.acquisitionDate,
              acquisition_quantity: m.acquisitionQuantity,
              stock_updated_at: m.stockUpdatedAt,
              orden_personalizado: index
          }));

          const { error } = await supabase.from('resident_medications').upsert(upsertPayload);
          if (error) console.warn("Error reordering medications:", error.message);
      } catch (e: any) {
           console.error("Unexpected error reordering medications:", e);
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

  // --- Users CRUD ---
  const handleSaveUser = useCallback(async (userData: Omit<ManagedUser, 'id'> | ManagedUser) => {
    try {
        let userToSave: ManagedUser;
        const isNew = !('id' in userData);
        if (!isNew) {
            userToSave = userData as ManagedUser;
        } else {
            const maxOrder = users.length > 0 ? Math.max(...users.map(u => u.displayOrder || 0)) : 0;
            userToSave = { ...userData, id: `user-${Date.now()}`, displayOrder: maxOrder + 1 };
        }
        setUsers(prevUsers => {
            if (isNew) return [...prevUsers, userToSave];
            return prevUsers.map(u => u.id === userToSave.id ? userToSave : u);
        });
        const basePayload = {
            id: userToSave.id,
            role: userToSave.role,
            name: userToSave.name,
            password: userToSave.password,
            permissions: userToSave.permissions,
        };
        const { error } = await supabase.from('app_users').upsert({
            ...basePayload,
            display_order: userToSave.displayOrder ?? 0
        });
        if (error) {
            const { error: retryError } = await supabase.from('app_users').upsert(basePayload);
            if (retryError) throw retryError;
        }
    } catch (e: any) {
        console.error("Error saving user:", e.message || e);
        alert("Error al guardar usuario.");
    }
  }, [users, setUsers]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
        setUsers(prev => prev.filter(u => u.id !== userId));
        const { error } = await supabase.from('app_users').delete().eq('id', userId);
        if (error) throw error;
    } catch (e: any) {
        console.error("Error deleting user:", e.message || e);
        alert("Error al eliminar usuario.");
        await onUsersMutated();
    }
  }, [setUsers, onUsersMutated]);

  const handleReorderUsers = useCallback(async (reorderedUsers: ManagedUser[]) => {
      setUsers(reorderedUsers);
      try {
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
          console.warn("Error reordering users:", e.message || e);
      }
  }, [setUsers]);

  const handleLogoutClick = () => { setIsLogoutModalOpen(true); };
  const handleConfirmLogout = () => { setIsLogoutModalOpen(false); onLogout(); };

  const renderPanel = () => {
    if (loadingData && activePanel !== Panel.AdminApp && residentMedications.length === 0) {
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
      const residentMeds = residentMedications
        .filter(m => m.residentId === selectedResident.id)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      return (
        <ResidentMedicationsPanel
          user={user}
          resident={selectedResident}
          onBack={handleBackToResidents}
          medications={residentMeds}
          onSaveMedication={handleSaveMedication}
          onDeleteMedication={handleDeleteMedication}
          onReorderMedications={handleReorderMedications} 
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
                  onRestoreData={handleRestoreData}
                  onForceDailyUpdate={handleForceDailyUpdate} // NEW PROP
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