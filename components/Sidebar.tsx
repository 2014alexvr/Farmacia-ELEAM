import React from 'react';
import { User, Panel } from '../types';
import HomeIcon from './icons/HomeIcon';
import PillIcon from './icons/PillIcon';
import UsersIcon from './icons/UsersIcon';
import SettingsIcon from './icons/SettingsIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import LogoutIcon from './icons/LogoutIcon';
import HeartPulseIcon from './icons/HeartPulseIcon';
import FamilyIcon from './icons/FamilyIcon';
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
  [Panel.SummaryFamily]: FamilyIcon,
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
        className={`group flex items-center w-full px-4 py-3.5 text-sm font-medium transition-all duration-200 rounded-xl mb-1 ${
          isActive
            ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-glow'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        {Icon && (
            <Icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-brand-secondary'}`} />
        )}
        <span>{panel}</span>
      </button>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-20 md:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileOpen(false)}
      />
      <aside className={`
        flex flex-col w-72 bg-slate-900 text-white p-5 h-full shadow-2xl border-r border-white/5
        fixed md:relative inset-y-0 left-0 z-30
        transform transition-transform duration-300 ease-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        print:hidden
      `}>
        <div className="flex justify-between items-start mb-8 pt-2">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">FARMACIA ELEAM</h1>
            <p className="text-sm font-medium text-brand-secondary mt-1">EL NAZARENO</p>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-400 hover:text-white transition-colors" aria-label="Cerrar menú">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
          <div className="space-y-0.5">
             <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 mt-2">Menu Principal</p>
             {availablePanels.map((panel) => (
               <NavLink key={panel} panel={panel} />
             ))}
          </div>
        </div>

        <div className="pt-6 mt-4 border-t border-white/10">
          <div className="flex items-center px-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center text-brand-secondary font-bold text-lg mr-3 border border-white/10">
                  {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.role}</p>
              </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-red-400 transition-all duration-200 bg-white/5 rounded-xl hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20"
          >
            <LogoutIcon className="w-5 h-5 mr-2" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;