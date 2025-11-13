
import React from 'react';
import Card from '../Card';
import UsersIcon from '../icons/UsersIcon';
import BrainIcon from '../icons/BrainIcon';
import PillIcon from '../icons/PillIcon';

const SummaryMentalHealthPanel: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{`Resumen de Salud Mental`}</h1>
      <p className="text-gray-600 mb-8">Resumen de datos relacionados con la medicación y estado de salud mental de los residentes.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Residentes con Tratamiento" value={2} icon={UsersIcon} color="bg-teal-500" />
        <Card title="Medicamentos Psicotrópicos" value={4} icon={PillIcon} color="bg-indigo-500" />
        <Card title="Evaluaciones Pendientes" value={1} icon={BrainIcon} color="bg-pink-500" />
      </div>

      <div className="mt-10 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Notas Relevantes</h2>
        <p className="text-gray-700">Sección para observaciones y seguimientos del equipo de salud mental.</p>
      </div>
    </div>
  );
};

export default SummaryMentalHealthPanel;
