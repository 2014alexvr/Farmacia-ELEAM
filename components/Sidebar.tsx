import React from 'react';
import { User, Panel } from '../types';
import HomeIcon from './icons/HomeIcon';
import PillIcon from './icons/PillIcon';
import UsersIcon from './icons/UsersIcon';
import SettingsIcon from './icons/SettingsIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import LogoutIcon from './icons/LogoutIcon';
import HeartPulseIcon from './icons/HeartPulseIcon';
import BrainIcon from './icons/BrainIcon';
import FamilyIcon from './icons/FamilyIcon';
import ShoppingCartIcon from './icons/ShoppingCartIcon';

interface SidebarProps {
  user: User;
  activePanel: Panel;
  setActivePanel: (panel: Panel) => void;
  onLogout: () => void;
  availablePanels: Panel[];
}

const panelIcons: Record<Panel, React.ElementType> = {
  [Panel.Dashboard]: HomeIcon,
  [Panel.Residents]: UsersIcon,
  [Panel.Medications]: PillIcon,
  [Panel.SummaryCesfam]: HeartPulseIcon,
  [Panel.SummaryIndividualStock]: ChartBarIcon,
  [Panel.SummaryMentalHealth]: BrainIcon,
  [Panel.SummaryFamily]: FamilyIcon,
  [Panel.SummaryPurchases]: ShoppingCartIcon,
  [Panel.ResidentMedications]: PillIcon,
  // FIX: Added missing panel icon mapping.
  [Panel.LowStockSummary]: ChartBarIcon,
};

const Sidebar: React.FC<SidebarProps> = ({ user, activePanel, setActivePanel, onLogout, availablePanels }) => {
  const NavLink: React.FC<{ panel: Panel }> = ({ panel }) => {
    const Icon = panelIcons[panel];
    const isActive = activePanel === panel;
    return (
      <button
        onClick={() => setActivePanel(panel)}
        className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg ${
          isActive
            ? 'bg-brand-secondary text-white shadow-md'
            : 'text-gray-200 hover:bg-brand-dark hover:text-white'
        }`}
      >
        {Icon && <Icon className="w-6 h-6 mr-3" />}
        <span className="font-medium">{panel}</span>
      </button>
    );
  };

  return (
    <aside className="flex flex-col w-64 bg-brand-primary text-white p-4 space-y-4">
      <div className="text-center py-4 border-b border-brand-dark">
        <h1 className="text-2xl font-bold">FARMACIA ELEAM</h1>
      </div>

      <div className="flex-1 space-y-2">
        {availablePanels.map((panel) => (
            <NavLink key={panel} panel={panel} />
        ))}
      </div>

      <div className="border-t border-brand-dark pt-4">
        <div className="text-center mb-4">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-gray-300">{user.role}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center justify-center w-full px-4 py-3 text-left transition-colors duration-200 bg-brand-dark rounded-lg hover:bg-red-700"
        >
          <LogoutIcon className="w-6 h-6 mr-3" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;