
import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon: Icon, color = 'bg-brand-primary', children }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
          <div className={`p-2 rounded-full ${color} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <p className="mt-2 text-4xl font-bold text-gray-800">{value}</p>
      </div>
      {children && <div className="mt-4 text-sm text-gray-600">{children}</div>}
    </div>
  );
};

export default Card;
