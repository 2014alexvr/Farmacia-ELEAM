import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string; // Used for text/icon color
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon: Icon, color = 'text-brand-primary', children }) => {
  // Map standard colors to modern Tailwind classes for backgrounds
  const getBgColor = (colorClass: string) => {
      if (colorClass.includes('red')) return 'bg-red-50 text-red-600';
      if (colorClass.includes('blue')) return 'bg-blue-50 text-blue-600';
      if (colorClass.includes('green')) return 'bg-emerald-50 text-emerald-600';
      if (colorClass.includes('yellow')) return 'bg-amber-50 text-amber-600';
      if (colorClass.includes('orange')) return 'bg-orange-50 text-orange-600';
      if (colorClass.includes('teal')) return 'bg-teal-50 text-teal-600';
      if (colorClass.includes('purple')) return 'bg-purple-50 text-purple-600';
      if (colorClass.includes('pink')) return 'bg-pink-50 text-pink-600';
      if (colorClass.includes('indigo')) return 'bg-indigo-50 text-indigo-600';
      return 'bg-brand-light text-brand-primary'; // Default
  };

  const styleClass = getBgColor(color);

  return (
    <div className="bg-white p-7 rounded-3xl shadow-soft hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <div className={`p-3 rounded-2xl ${styleClass} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <p className="text-4xl font-extrabold text-slate-800 tracking-tight">{value}</p>
      </div>
      {children && <div className="mt-4 pt-4 border-t border-slate-50 text-sm font-medium">{children}</div>}
    </div>
  );
};

export default Card;