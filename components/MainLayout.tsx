import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { User, Panel, Resident, ResidentMedication, ManagedUser, MedicalReport } from '../types';
import { ROLE_PANELS, MOCK_RESIDENTS, MOCK_RESIDENT_MEDICATIONS } from '../constants';
import Sidebar from './Sidebar';
import DashboardModern from './panels/DashboardModern'; // NEW IMPORT
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

interface MainLayoutProps {
  user: User;
  onLogout: () => void;
  users: ManagedUser[];
  setUsers: React.Dispatch<React.SetStateAction<ManagedUser[]>>;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user, onLogout, users, setUsers }) => {
  const availablePanels = useMemo(() => ROLE_PANELS[user.role], [user.role]);
  const [activePanel, setActivePanel] = useState<Panel>(availablePanels[0] || Panel.Dashboard);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [residents, setResidents] = useState<Resident[]>(() => {
    try {
      const savedResidents = localStorage.getItem('farmaciaEleam_residents');
      return savedResidents ? JSON.parse(savedResidents) : MOCK_RESIDENTS;
    } catch (error) {
      return MOCK_RESIDENTS;
    }
  });
  const [residentMedications, setResidentMedications] = useState<ResidentMedication[]>(() => {
    try {
      const savedMeds = localStorage.getItem('farmaciaEleam_residentMedications');
      return savedMeds ? JSON.parse(savedMeds) : MOCK_RESIDENT_MEDICATIONS;
    } catch (error) {
      return MOCK_RESIDENT_MEDICATIONS;
    }
  });
  
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>(() => {
    try {
      const savedReports = localStorage.getItem('farmaciaEleam_medicalReports');
      return savedReports ? JSON.parse(savedReports) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => { try { localStorage.setItem('farmaciaEleam_residents', JSON.stringify(residents)); } catch (e){} }, [residents]);
  useEffect(() => { try { localStorage.setItem('farmaciaEleam_residentMedications', JSON.stringify(residentMedications)); } catch (e){} }, [residentMedications]);
  useEffect(() => { try { localStorage.setItem('farmaciaEleam_medicalReports', JSON.stringify(medicalReports)); } catch (e){} }, [medicalReports]);

  const handleSelectResident = (resident: Resident) => { setSelectedResident(resident); setActivePanel(Panel.ResidentMedications); };
  const handleBackToResidents = () => { setSelectedResident(null); setActivePanel(Panel.Residents); };
  const handleSaveResident = useCallback((residentData: Omit<Resident, 'id'> | Resident) => { if ('id' in residentData) { setResidents(prev => prev.map(r => r.id === residentData.id ? residentData : r)); } else { const newResident = { ...residentData, id: Date.now() }; setResidents(prev => [...prev, newResident]); } }, []);
  const handleDeleteResident = useCallback((residentId: number) => { setResidents(prev => prev.filter(r => r.id !== residentId)); setResidentMedications(prev => prev.filter(m => m.residentId !== residentId)); }, []);
  const handleSaveMedication = useCallback((medicationData: Omit<ResidentMedication, 'id' | 'residentId'> | ResidentMedication) => { if ('id' in medicationData) { setResidentMedications(prev => prev.map(m => m.id === medicationData.id ? medicationData : m)); } else { if (selectedResident) { const newMedication = { ...medicationData, id: `RMED${Date.now()}`, residentId: selectedResident.id, }; setResidentMedications(prev => [...prev, newMedication]); } } }, [selectedResident]);
  const handleDeleteMedication = useCallback((medicationId: string) => { setResidentMedications(prev => prev.filter(m => m.id !== medicationId)); }, []);
  const handleSaveReport = useCallback((report: MedicalReport) => { setMedicalReports(prev => [report, ...prev]); }, []);
  const handleDeleteReport = useCallback((reportId: string) => { setMedicalReports(prev => prev.filter(r => r.id !== reportId)); }, []);
  const handleLogoutClick = () => { setIsLogoutModalOpen(true); };
  const handleConfirmLogout = () => { setIsLogoutModalOpen(false); onLogout(); };
  const handleSaveUser = useCallback((userData: Omit<ManagedUser, 'id'> | ManagedUser) => { if ('id' in userData) { setUsers(prev => prev.map(u => u.id === userData.id ? userData : u)); } else { const newUser = { ...userData, id: `user-${Date.now()}` }; setUsers(prev => [...prev, newUser]); } }, [setUsers]);
  const handleDeleteUser = useCallback((userId: string) => { setUsers(prev => prev.filter(u => u.id !== userId)); }, [setUsers]);

  const renderPanel = () => {
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
        />
      );
    }

    switch (activePanel) {
      case Panel.Dashboard:
        return <DashboardModern user={user} residents={residents} residentMedications={residentMedications} onNavigate={setActivePanel} />;
      case Panel.Residents:
        return <ResidentsPanel user={user} onSelectResident={handleSelectResident} residents={residents} onSaveResident={handleSaveResident} onDeleteResident={handleDeleteResident} />;
      case Panel.Medications: return <MedicationsPanel />;
      case Panel.GeneralInventory: return <GeneralInventoryPanel residentMedications={residentMedications} residents={residents} />;
      case Panel.SummaryCesfam: return <SummaryCesfamPanel residents={residents} residentMedications={residentMedications} />;
      case Panel.SummaryIndividualStock: return <SummaryIndividualStockPanel residents={residents} residentMedications={residentMedications} onSelectResident={handleSelectResident} />;
      case Panel.SummaryMentalHealth: return <SummaryMentalHealthPanel />;
      case Panel.SummaryFamily: return <SummaryFamilyPanel />;
      case Panel.SummaryPurchases: return <SummaryPurchasesPanel />;
      case Panel.AdminApp: return <AdminAppPanel currentUser={user} users={users} onSaveUser={handleSaveUser} onDeleteUser={handleDeleteUser} />;
      default: return <DashboardModern user={user} residents={residents} residentMedications={residentMedications} onNavigate={setActivePanel} />;
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