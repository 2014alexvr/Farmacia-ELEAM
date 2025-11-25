import React, { useState } from 'react';
import { UserRole, ManagedUser } from '../types';
import PillIcon from './icons/PillIcon';
import CloseIcon from './icons/CloseIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';
import UsersIcon from './icons/UsersIcon';
import HeartPulseIcon from './icons/HeartPulseIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import SettingsIcon from './icons/SettingsIcon';
import FamilyIcon from './icons/FamilyIcon';

interface LoginScreenProps {
  users: ManagedUser[];
  onLogin: (userId: string, passwordAttempt: string) => boolean;
}

const LoginScreenModern: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Helper para obtener icono según rol
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin: return SettingsIcon;
      case UserRole.Tens: return HeartPulseIcon;
      case UserRole.Director: return DocumentTextIcon;
      case UserRole.Visitor: return FamilyIcon;
      default: return UsersIcon;
    }
  };

  // Helper para color de icono
  const getRoleColorClass = (role: UserRole) => {
      switch (role) {
          case UserRole.Admin: return 'text-slate-600 bg-slate-200';
          case UserRole.Tens: return 'text-emerald-600 bg-emerald-100';
          case UserRole.Director: return 'text-blue-600 bg-blue-100';
          case UserRole.Visitor: return 'text-amber-600 bg-amber-100';
          default: return 'text-slate-600 bg-slate-100';
      }
  };

  const handleUserSelect = (user: ManagedUser) => {
    setSelectedUser(user);
    setError('');
    setPassword('');
    setIsPasswordVisible(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const success = onLogin(selectedUser.id, password);
    if (!success) {
      setError('Contraseña incorrecta.');
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setError('');
    setPassword('');
  };

  // Estilos modernos (Dark Inputs)
  const labelStyle = "block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-2";
  const inputStyle = "block w-full px-5 py-4 bg-slate-700 border border-slate-600 text-white font-medium focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all placeholder-slate-400 shadow-inner rounded-2xl text-base";

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-slate-900 relative overflow-hidden font-sans">
        
        {/* Fondo Decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-dark opacity-80" />
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Contenedor Principal */}
        <div className="w-full max-w-lg relative z-10 p-4 animate-fade-in-down">
          <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white/10 ring-1 ring-black/20 relative flex flex-col max-h-[90vh]">
             
             {/* Barra Superior Decorativa Global */}
             <div className="h-3 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary w-full shrink-0" />
             
             <div className="p-8 sm:p-10 flex flex-col h-full overflow-hidden">
                {/* Header Logo */}
                <div className="text-center mb-8 shrink-0">
                    <div className="inline-flex justify-center items-center p-4 bg-brand-light rounded-[24px] shadow-sm border border-brand-secondary/20 mb-4">
                        <PillIcon className="w-10 h-10 text-brand-primary" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">FARMACIA ELEAM</h1>
                    <p className="text-brand-primary font-bold tracking-[0.2em] text-[10px] uppercase mt-2">El Nazareno</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4">
                    <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mb-4">Seleccione su Usuario</p>
                    
                    {/* LISTA DE USUARIOS (GRID) */}
                    <div className="grid grid-cols-1 gap-3">
                        {users.map((user) => {
                            const Icon = getRoleIcon(user.role);
                            const iconClass = getRoleColorClass(user.role);

                            return (
                                <button
                                    key={user.id}
                                    onClick={() => handleUserSelect(user)}
                                    className="group relative w-full bg-slate-50 rounded-2xl p-4 shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-md hover:border-brand-primary/40 hover:bg-white text-left flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${iconClass} transition-transform group-hover:scale-110`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-slate-700 text-sm group-hover:text-brand-primary transition-colors">
                                                {user.name}
                                            </span>
                                            {/* Subtitle Removed */}
                                        </div>
                                    </div>
                                    
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-300 shadow-sm border border-slate-100 group-hover:text-brand-secondary group-hover:border-brand-secondary/30 transition-all">
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                <div className="mt-6 text-center shrink-0">
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Gestión de Medicamentos v6.0</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Modal de Contraseña (Overlay) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex justify-center items-center p-6 animate-scale-in">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm relative overflow-hidden border border-white/20 ring-1 ring-black/10">
            
            {/* Barra Superior */}
            <div className="h-4 bg-gradient-to-r from-brand-secondary to-brand-primary w-full" />
            
            <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Hola, {selectedUser.name.split(' ')[0]}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
                        <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest">{selectedUser.role}</p>
                    </div>
                </div>
                <button 
                    onClick={closeModal} 
                    className="p-3 bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-8 pt-4 space-y-6">
               
               {/* Nombre Completo Display (Readonly visual) */}
               <div>
                  <label className={labelStyle}>Usuario Seleccionado</label>
                  <div className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm flex items-center gap-3">
                      <UsersIcon className="w-4 h-4 text-slate-400" />
                      {selectedUser.name}
                  </div>
               </div>

               <div>
                  <label className={labelStyle}>Contraseña</label>
                  <div className="relative">
                    <input
                      type={isPasswordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputStyle} pr-12`}
                      required
                      autoFocus
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-white transition-colors"
                      aria-label={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {isPasswordVisible ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
               </div>

               {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
                    <p className="text-red-600 text-xs font-bold">{error}</p>
                  </div>
               )}

               <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 hover:text-slate-800 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-1 transition-all active:scale-95"
                    >
                        Ingresar
                    </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginScreenModern;
