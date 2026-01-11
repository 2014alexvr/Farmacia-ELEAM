import React from 'react';

interface ZoomControlsProps {
  zoom: number;
  setZoom: (zoom: number) => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoom, setZoom }) => {
  const handleZoomIn = () => setZoom(Number(Math.min(zoom + 0.1, 1.5).toFixed(1)));
  const handleZoomOut = () => setZoom(Number(Math.max(zoom - 0.1, 0.5).toFixed(1)));
  const handleReset = () => setZoom(1);

  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
      <span className="text-[10px] font-bold text-slate-400 uppercase mr-1 ml-2 hidden sm:inline">Zoom:</span>
      <button 
        onClick={handleZoomOut} 
        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-600 font-bold shadow-sm hover:text-brand-primary hover:scale-105 active:scale-95 transition-all border border-slate-200 text-lg leading-none"
        title="Reducir (Alejar)"
      >
        -
      </button>
      <button 
        onClick={handleReset} 
        className="px-2 h-8 flex items-center justify-center bg-white rounded-lg text-xs font-bold text-slate-700 shadow-sm min-w-[3.5rem] hover:text-brand-primary active:scale-95 transition-all border border-slate-200"
        title="Restablecer (100%)"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button 
        onClick={handleZoomIn} 
        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-600 font-bold shadow-sm hover:text-brand-primary hover:scale-105 active:scale-95 transition-all border border-slate-200 text-lg leading-none"
        title="Aumentar (Acercar)"
      >
        +
      </button>
    </div>
  );
};

export default ZoomControls;