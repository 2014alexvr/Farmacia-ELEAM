

import React, { useState, useMemo, useCallback } from 'react';
import { User, Panel, Resident, ResidentMedication } from '../types';
import { ROLE_PANELS, MOCK_RESIDENTS, MOCK_RESIDENT_MEDICATIONS } from '../constants';
import Sidebar from './Sidebar';
import Dashboard from './panels/Dashboard';
// FIX: Changed import to named import.
import { ResidentsPanel } from './panels/ResidentsPanel';
import MedicationsPanel from './panels/MedicationsPanel';
import SummaryCesfamPanel from './panels/SummaryCesfamPanel';
import SummaryIndividualStockPanel from './panels/SummaryIndividualStockPanel';
import ResidentMedicationsPanel from './panels/ResidentMedicationsPanel';
import SummaryMentalHealthPanel from './panels/SummaryMentalHealthPanel';
import SummaryFamilyPanel from './panels/SummaryFamilyPanel';
import SummaryPurchasesPanel from './panels/SummaryPurchasesPanel';

interface MainLayoutProps {
  user: User;
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user, onLogout }) => {
  const availablePanels = useMemo(() => ROLE_PANELS[user.role], [user.role]);
  const [activePanel, setActivePanel] = useState<Panel>(availablePanels[0] || Panel.Dashboard);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  const [residents, setResidents] = useState<Resident[]>(MOCK_RESIDENTS);
  const [residentMedications, setResidentMedications] = useState<ResidentMedication[]>(MOCK_RESIDENT_MEDICATIONS);

  const handleSelectResident = (resident: Resident) => {
    setSelectedResident(resident);
    setActivePanel(Panel.ResidentMedications);
  };

  const handleBackToResidents = () => {
    setSelectedResident(null);
    setActivePanel(Panel.Residents);
  };
  
  const handleSaveResident = useCallback((residentData: Omit<Resident, 'id'> | Resident) => {
    if ('id' in residentData) {
      // Editing existing resident
      setResidents(prev => prev.map(r => r.id === residentData.id ? residentData : r));
    } else {
      // Adding new resident
      const newResident = { ...residentData, id: Date.now() };
      setResidents(prev => [...prev, newResident]);
    }
  }, []);

  const handleDeleteResident = useCallback((residentId: number) => {
    setResidents(prev => prev.filter(r => r.id !== residentId));
    // Also delete their medications
    setResidentMedications(prev => prev.filter(m => m.residentId !== residentId));
  }, []);
  
  const handleSaveMedication = useCallback((medicationData: Omit<ResidentMedication, 'id' | 'residentId'> | ResidentMedication) => {
    if ('id' in medicationData) {
        // Editing
        setResidentMedications(prev => prev.map(m => m.id === medicationData.id ? medicationData : m));
    } else {
        // Adding
        if (selectedResident) {
            const newMedication = {
                ...medicationData,
                id: `RMED${Date.now()}`,
                residentId: selectedResident.id,
            };
            setResidentMedications(prev => [...prev, newMedication]);
        }
    }
  }, [selectedResident]);

  const handleDeleteMedication = useCallback((medicationId: string) => {
    setResidentMedications(prev => prev.filter(m => m.id !== medicationId));
  }, []);


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
        />
      );
    }

    switch (activePanel) {
      case Panel.Dashboard:
        return <Dashboard user={user} />;
      case Panel.Residents:
        return (
          <ResidentsPanel 
            user={user} 
            onSelectResident={handleSelectResident}
            residents={residents}
            onSaveResident={handleSaveResident}
            onDeleteResident={handleDeleteResident}
          />
        );
      case Panel.Medications:
        return <MedicationsPanel />;
      case Panel.SummaryCesfam:
        return <SummaryCesfamPanel residents={residents} residentMedications={residentMedications} />;
      case Panel.SummaryIndividualStock:
        return <SummaryIndividualStockPanel residents={residents} residentMedications={residentMedications} onSelectResident={handleSelectResident} />;
      case Panel.SummaryMentalHealth:
        return <SummaryMentalHealthPanel />;
      case Panel.SummaryFamily:
        return <SummaryFamilyPanel />;
      case Panel.SummaryPurchases:
        return <SummaryPurchasesPanel />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar 
        user={user} 
        activePanel={activePanel} 
        setActivePanel={setActivePanel} 
        onLogout={onLogout} 
        availablePanels={availablePanels}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderPanel()}
      </main>
    </div>
  );
};

export default MainLayout;