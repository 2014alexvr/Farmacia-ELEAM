
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MOCK_PURCHASES_DATA, MOCK_MEDICATIONS } from '../../constants';
import Card from '../Card';
import PillIcon from '../icons/PillIcon';
import ShoppingCartIcon from '../icons/ShoppingCartIcon';

const SummaryPurchasesPanel: React.FC = () => {
  const lowStockItems = MOCK_MEDICATIONS.filter(med => med.stock < med.lowStockThreshold).length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{`Resumen de Compras`}</h1>
      <p className="text-gray-600 mb-8">Análisis de costos y necesidades de compra de medicamentos.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title="Items con Bajo Stock" value={lowStockItems} icon={PillIcon} color="bg-red-500" />
        <Card title="Costo Estimado Próxima Compra" value={'$450.000'} icon={ShoppingCartIcon} color="bg-green-500" />
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Costos de Compras Mensuales (Últimos 6 meses)</h2>
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <BarChart
                    data={MOCK_PURCHASES_DATA}
                    margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-CL')}`} />
                    <Legend />
                    <Bar dataKey="Costo Total" fill="#4A90E2" />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SummaryPurchasesPanel;
