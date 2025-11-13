import { Panel, UserRole, Resident, Medication, ResidentMedication, Provenance, PermissionLevel } from './types';

export const USER_CREDENTIALS: Record<UserRole, { password: string; permissions: PermissionLevel; name: string }> = {
  [UserRole.Admin]: { password: 'admin1122', permissions: 'Total', name: 'Administración ELEAM' },
  [UserRole.Director]: { password: 'pin1122', permissions: 'Solo Lectura', name: 'Dirección Técnica' },
  [UserRole.Tens]: { password: 'pau1122', permissions: 'Modificar', name: 'Tens' },
  [UserRole.Visitor]: { password: 'visita1122', permissions: 'Solo Lectura', name: 'Visita' },
};


export const MOCK_RESIDENTS: Resident[] = [
  { id: 1, name: 'Jaime Eduardo Sanhueza Vivanco', rut: '5.854.672-0', dateOfBirth: '1946-12-10' },
  { id: 2, name: 'Raúl Jiménez Ramos', rut: '3.325.600-0', dateOfBirth: '1935-09-16' },
  { id: 3, name: 'Ana Rosa Peirano Ibaceta', rut: '4.916.829-2', dateOfBirth: '1945-05-04' },
  { id: 4, name: 'Jorge Rodolfo Medina Mocada', rut: '4.806.439-6', dateOfBirth: '1944-07-06' },
  { id: 5, name: 'Eugenio Ernesto González Basualto', rut: '4.402.706-2', dateOfBirth: '1940-03-05' },
  { id: 6, name: 'Rosa de las Mercedes Ahumada Loyola', rut: '4.808.912-7', dateOfBirth: '1944-08-12' },
  { id: 7, name: 'Edmundo Fernando Jorquera Quiroga', rut: '4.158.390-8', dateOfBirth: '1949-04-05' },
  { id: 8, name: 'Patricia Vivian De la Fuente Soto', rut: '7.383.363-9', dateOfBirth: '1956-12-22' },
  { id: 9, name: 'Celia Ester Caneleo Figueroa', rut: '489.292-5', dateOfBirth: '1946-11-08' },
  { id: 10, name: 'Zulema Olimpia Peña Díaz', rut: '5.616.384-0', dateOfBirth: '1948-11-26' },
  { id: 11, name: 'María Jiménez Torrejón', rut: '4.966.179-7', dateOfBirth: '1940-12-24' },
  { id: 12, name: 'Nancy Flores Sánchez', rut: '6.626.697-4', dateOfBirth: '1950-01-22' },
  { id: 13, name: 'Myriam Jeanette Silva Jara', rut: '9.137.387-4', dateOfBirth: '1962-09-13' },
  { id: 14, name: 'Gladys Nelsa Del Carmen Arellano Pavez', rut: '4.204.630-2', dateOfBirth: '1940-01-07' },
  { id: 15, name: 'Genoveva Del Carmen Sáez Hernández', rut: '3.139.105-9', dateOfBirth: '1933-10-24' },
  { id: 16, name: 'Rita Del Carmen Torres Briceño', rut: '6.688.988-2', dateOfBirth: '1950-03-07' },
];

export const MOCK_MEDICATIONS: Medication[] = [
    { id: 'MED001', name: 'Losartán 50mg', stock: 500, unit: 'comprimidos', lastOrdered: '2024-06-20', lowStockThreshold: 100 },
    { id: 'MED002', name: 'Aspirina 100mg', stock: 800, unit: 'comprimidos', lastOrdered: '2024-06-15', lowStockThreshold: 200 },
    { id: 'MED003', name: 'Metformina 850mg', stock: 350, unit: 'comprimidos', lastOrdered: '2024-07-01', lowStockThreshold: 150 },
    { id: 'MED004', name: 'Atorvastatina 20mg', stock: 60, unit: 'comprimidos', lastOrdered: '2024-05-28', lowStockThreshold: 100 },
    { id: 'MED005', name: 'Omeprazol 20mg', stock: 1200, unit: 'comprimidos', lastOrdered: '2024-07-05', lowStockThreshold: 300 },
    { id: 'MED006', name: 'Sertralina 50mg', stock: 250, unit: 'comprimidos', lastOrdered: '2024-06-18', lowStockThreshold: 100 },
    { id: 'MED007', name: 'Paracetamol 500mg', stock: 90, unit: 'comprimidos', lastOrdered: '2024-07-02', lowStockThreshold: 100 },
    { id: 'MED008', name: 'Insulina Glargina', stock: 20, unit: 'unidades', lastOrdered: '2024-07-10', lowStockThreshold: 15 },
];

export const MOCK_RESIDENT_MEDICATIONS: ResidentMedication[] = [
    { 
        id: 'RMED001', residentId: 1, medicationName: 'Losartán 50mg', 
        doseValue: '50', doseUnit: 'Mg',
        schedules: [
            { time: '08:00', quantity: 1, unit: 'Comp' },
            { time: '20:00', quantity: 1, unit: 'Comp' }
        ],
        stock: 10, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2024-07-15'
    },
    { 
        id: 'RMED002', residentId: 1, medicationName: 'Aspirina 100mg',
        doseValue: '100', doseUnit: 'Mg',
        schedules: [
            { time: '08:00', quantity: 1, unit: 'Comp' }
        ],
        stock: 30, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2024-07-15'
    },
    { 
        id: 'RMED003', residentId: 3, medicationName: 'Metformina 850mg',
        doseValue: '850', doseUnit: 'Mg',
        schedules: [
            { time: '08:00', quantity: 1, unit: 'Comp' },
            { time: '20:00', quantity: 1, unit: 'Comp' }
        ],
        stock: 90, stockUnit: 'Comp', provenance: 'Cesfam', deliveryDate: '2024-07-10'
    },
    { 
        id: 'RMED004', residentId: 3, medicationName: 'Sertralina 50mg',
        doseValue: '50', doseUnit: 'Mg',
        schedules: [
            { time: '09:00', quantity: 1, unit: 'Comp' }
        ],
        stock: 5, stockUnit: 'Comp', provenance: 'Compras', deliveryDate: '2024-07-20'
    },
    { 
        id: 'RMED005', residentId: 5, medicationName: 'Omeprazol 20mg',
        doseValue: '20', doseUnit: 'Mg',
        schedules: [
            { time: '07:30', quantity: 1, unit: 'Comp' }
        ],
        stock: 60, stockUnit: 'Comp', provenance: 'Donación', deliveryDate: '2024-06-30'
    },
];


export const MOCK_PURCHASES_DATA = [
  { name: 'Enero', 'Costo Total': 4000 },
  { name: 'Febrero', 'Costo Total': 3000 },
  { name: 'Marzo', 'Costo Total': 5000 },
  { name: 'Abril', 'Costo Total': 4500 },
  { name: 'Mayo', 'Costo Total': 6000 },
  { name: 'Junio', 'Costo Total': 5500 },
];


export const ROLE_PANELS: Record<UserRole, Panel[]> = {
  [UserRole.Admin]: [
    Panel.Dashboard,
    Panel.Residents,
    Panel.SummaryCesfam,
    Panel.SummaryIndividualStock,
  ],
  [UserRole.Director]: [
    Panel.Dashboard,
    Panel.Residents,
    Panel.SummaryCesfam,
    Panel.SummaryIndividualStock,
  ],
  [UserRole.Tens]: [
    Panel.Dashboard,
    Panel.Residents,
    Panel.SummaryCesfam,
    Panel.SummaryIndividualStock,
  ],
  [UserRole.Visitor]: [
    Panel.Dashboard,
    Panel.Residents,
  ],
};