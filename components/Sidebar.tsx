
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
import CloseIcon from './icons/CloseIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';

interface SidebarProps {
  user: User;
  activePanel: Panel;
  setActivePanel: (panel: Panel) => void;
  onLogout: () => void;
  availablePanels: Panel[];
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const panelIcons: Record<Panel, React.ElementType> = {
  [Panel.Dashboard]: HomeIcon,
  [Panel.Residents]: UsersIcon,
  [Panel.Medications]: PillIcon,
  [Panel.GeneralInventory]: ClipboardListIcon,
  [Panel.SummaryCesfam]: HeartPulseIcon,
  [Panel.SummaryIndividualStock]: ChartBarIcon,
  [Panel.SummaryMentalHealth]: BrainIcon,
  [Panel.SummaryFamily]: FamilyIcon,
  [Panel.SummaryPurchases]: ShoppingCartIcon,
  [Panel.AdminApp]: SettingsIcon,
  [Panel.ResidentMedications]: PillIcon,
  [Panel.LowStockSummary]: ChartBarIcon,
};

const Sidebar: React.FC<SidebarProps> = ({ user, activePanel, setActivePanel, onLogout, availablePanels, isMobileOpen, setIsMobileOpen }) => {
  const NavLink: React.FC<{ panel: Panel }> = ({ panel }) => {
    const Icon = panelIcons[panel];
    const isActive = activePanel === panel;
    return (
      <button
        onClick={() => {
          setActivePanel(panel)
          setIsMobileOpen(false);
        }}
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
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileOpen(false)}
      />
      <aside className={`
        flex flex-col w-64 bg-brand-primary text-white p-4 space-y-4 h-full
        fixed md:relative inset-y-0 left-0 z-30
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="flex justify-between items-center text-center py-4 border-b border-brand-dark">
          <h1 className="text-2xl font-bold">FARMACIA ELEAM</h1>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-gray-300 hover:text-white" aria-label="Cerrar menú">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
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
    </>
  );
};

export default Sidebar;