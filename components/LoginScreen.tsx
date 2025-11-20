
import React, { useState, useMemo } from 'react';
import { UserRole, ManagedUser } from '../types';
import PillIcon from './icons/PillIcon';
import CloseIcon from './icons/CloseIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface LoginScreenProps {
  users: ManagedUser[];
  onLogin: (userId: string, passwordAttempt: string) => boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const roles = Object.values(UserRole);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const usersForSelectedRole = useMemo(() => {
    if (!selectedRole) return [];
    return users.filter(u => u.role === selectedRole);
  }, [selectedRole, users]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const firstUserInRole = users.find(u => u.role === role);
    setSelectedUserId(firstUserInRole ? firstUserInRole.id : '');
    setError('');
    setPassword('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    const success = onLogin(selectedUserId, password);
    if (!success) {
      setError('Contraseña incorrecta.');
    }
  };

  const closeModal = () => {
    setSelectedRole(null);
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
        <div className="w-full max-w-md relative z-10 p-6 animate-fade-in-down">
          <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white/10 ring-1 ring-black/20 relative">
             
             {/* Barra Superior Decorativa Global */}
             <div className="h-3 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary w-full" />
             
             <div className="p-8 sm:p-10">
                {/* Header Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex justify-center items-center p-5 bg-brand-light rounded-[28px] shadow-sm border border-brand-secondary/20 mb-6">
                        <PillIcon className="w-12 h-12 text-brand-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">FARMACIA ELEAM</h1>
                    <p className="text-brand-primary font-bold tracking-[0.2em] text-xs uppercase mt-3">El Nazareno</p>
                </div>

                {/* LISTA DE BOTONES - ESTILO TARJETA GRIS (RESIDENTES) */}
                <div className="space-y-5">
                    <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mb-2">Seleccione Perfil</p>
                    
                    {roles.map((role) => (
                    <button
                        key={role}
                        onClick={() => handleRoleSelect(role)}
                        className="group relative w-full bg-slate-200 rounded-3xl p-0 overflow-hidden shadow-lg shadow-slate-300/50 border border-slate-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-400/50 hover:bg-slate-50 hover:border-brand-primary/50"
                    >
                        {/* Barra Decorativa del Botón */}
                        <div className="h-1.5 bg-gradient-to-r from-brand-primary to-brand-secondary w-full shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="p-5 flex justify-between items-center">
                            <div className="text-left pl-2">
                                <span className="block font-extrabold text-slate-600 uppercase tracking-wide text-sm group-hover:text-brand-primary transition-colors">
                                    {role}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium group-hover:text-brand-secondary/80 transition-colors">Clic para ingresar</span>
                            </div>
                            
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-200 group-hover:text-brand-secondary group-hover:scale-110 transition-all duration-300">
                                <ArrowRightIcon className="w-5 h-5" />
                            </div>
                        </div>
                    </button>
                    ))}
                </div>
                
                <div className="mt-10 text-center">
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Gestión de Medicamentos v3.0</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Modal de Contraseña (Overlay) */}
      {selectedRole && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex justify-center items-center p-6 animate-scale-in">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm relative overflow-hidden border border-white/20 ring-1 ring-black/10">
            
            {/* Barra Superior */}
            <div className="h-4 bg-gradient-to-r from-brand-secondary to-brand-primary w-full" />
            
            <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Acceso</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
                        <p className="text-xs text-brand-primary font-bold uppercase tracking-widest">{selectedRole}</p>
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
               <div>
                  <label className={labelStyle}>Usuario</label>
                  <div className="relative">
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className={`${inputStyle} appearance-none cursor-pointer hover:bg-slate-600`}
                    >
                      {usersForSelectedRole.map(user => (
                        <option key={user.id} value={user.id} className="bg-slate-800 text-white py-2">{user.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-white/50">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>
               </div>

               <div>
                  <label className={labelStyle}>Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputStyle}
                    required
                    autoFocus
                    placeholder="••••••••"
                  />
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

export default LoginScreen;
