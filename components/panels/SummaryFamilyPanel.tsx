
import React from 'react';
import Card from '../Card';
import UsersIcon from '../icons/UsersIcon';
import PillIcon from '../icons/PillIcon';
import FamilyIcon from '../icons/FamilyIcon';

const SummaryFamilyPanel: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{`Resumen para Familiares`}</h1>
      <p className="text-gray-600 mb-8">Información simplificada y autorizada para la vista de familiares y visitas.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Próxima Dosis (General)" value={'14:00 hrs'} icon={PillIcon} color="bg-cyan-500" />
        <Card title="Actividades del Día" value={3} icon={FamilyIcon} color="bg-lime-500" />
        <Card title="Comunicados Importantes" value={1} icon={UsersIcon} color="bg-amber-500" />
      </div>

      <div className="mt-10 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Información sobre Medicamentos del Residente</h2>
        <p className="text-gray-700">
          Para proteger la privacidad y seguridad, los detalles específicos de los medicamentos no se muestran en este panel. 
          Por favor, contacte a la Dirección Técnica para cualquier consulta sobre el tratamiento farmacológico de su familiar.
        </p>
      </div>
    </div>
  );
};

export default SummaryFamilyPanel;
