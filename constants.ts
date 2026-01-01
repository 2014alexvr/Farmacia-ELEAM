import { Panel, UserRole, Resident, Medication, ResidentMedication, Provenance, PermissionLevel, ManagedUser, GeneralMedication } from './types';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionLevel> = {
  [UserRole.Admin]: 'Total',
  [UserRole.Director]: 'Solo Lectura',
  [UserRole.Tens]: 'Modificar',
  [UserRole.Visitor]: 'Solo Lectura',
};

export const MOCK_USERS: ManagedUser[] = [
  { id: 'user-admin', role: UserRole.Admin, name: 'Administración ELEAM', password: 'admin1122', permissions: 'Total' },
  { id: 'user-director', role: UserRole.Director, name: 'Dirección Técnica', password: 'dt1122', permissions: 'Solo Lectura' },
  { id: 'user-tens', role: UserRole.Tens, name: 'Tens', password: 'pau1122', permissions: 'Modificar' },
  { id: 'user-visitor', role: UserRole.Visitor, name: 'Visita', password: 'visita1122', permissions: 'Solo Lectura' },
];

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
  { id: '1', name: 'Paracetamol', stock: 100, unit: 'comprimidos', lastOrdered: '2023-10-01', lowStockThreshold: 10 },
  { id: '2', name: 'Ibuprofeno', stock: 5, unit: 'comprimidos', lastOrdered: '2023-10-05', lowStockThreshold: 10 },
];

export const MOCK_RESIDENT_MEDICATIONS: ResidentMedication[] = [];

// LISTA DE MEDICAMENTOS EXTRAÍDA DE LA IMAGEN
export const INITIAL_GENERAL_KIT_DATA: Omit<GeneralMedication, 'id'>[] = [
  { nombre_medicamento: 'Paracetamol', formato: '500 mg', cantidad_total: 431, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Trioval', formato: '564 mg', cantidad_total: 17, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Enalapril', formato: '10 mg', cantidad_total: 144, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Quetiapina', formato: '100 mg', cantidad_total: 38, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Quetiapina', formato: '25 mg', cantidad_total: 57, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Losartán', formato: '50 mg', cantidad_total: 200, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Risperidona', formato: '1 mg', cantidad_total: 30, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Sulfato Ferroso', formato: '200 mg', cantidad_total: 80, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Espironolactona', formato: '25 mg', cantidad_total: 10, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Melatonina', formato: '3 mg', cantidad_total: 30, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Clorpromazina', formato: '100 mg', cantidad_total: 210, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Desloratadina', formato: '5 mg', cantidad_total: 37, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Levetiracetam', formato: '500 mg', cantidad_total: 30, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Aspirina', formato: '100 mg', cantidad_total: 125, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Fluoxetina', formato: '20 mg', cantidad_total: 80, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Atorvastatina', formato: '20 mg', cantidad_total: 107, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Carbamazepina', formato: '200 mg', cantidad_total: 49, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Zopiclona', formato: '7,5 mg', cantidad_total: 15, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Amlodipino', formato: '10 mg', cantidad_total: 10, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Ciprofloxacino', formato: '500 mg', cantidad_total: 17, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Eutirox', formato: '100 mg', cantidad_total: 100, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Levotiroxina', formato: '50 mg', cantidad_total: 30, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Metamizol', formato: '300 mg', cantidad_total: 11, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Loratadina', formato: '10 mg', cantidad_total: 20, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Domperidona', formato: '10 mg', cantidad_total: 16, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Celecoxib', formato: '200 mg', cantidad_total: 10, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Hidroclorotiazida', formato: '50 mg', cantidad_total: 34, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Aciclovir', formato: '400 mg', cantidad_total: 33, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Captopril', formato: '25 mg', cantidad_total: 30, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Nitrofurantoína', formato: '100 mg', cantidad_total: 11, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Amoxicilina/Ac. Clavulánico', formato: '875/125 mg', cantidad_total: 23, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Eutirox', formato: '88 mg', cantidad_total: 21, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Aciclovir Crema', formato: '5% Frasco', cantidad_total: 0.5, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Tapsin Día', formato: 'Sobre mg', cantidad_total: 3, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Tapsin Noche', formato: 'Sobre mg', cantidad_total: 2, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Atenolol', formato: '50 mg', cantidad_total: 30, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Pramipexol Diclohidrato', formato: '0,25 mg', cantidad_total: 90, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Oftabiótico ungüento', formato: '3,5 Gr Frasco', cantidad_total: 0.25, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Oftabiótico Gramicidina+Polimixina', formato: 'Frasco', cantidad_total: 0.5, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Oftol Loteprednol + Tobramicina', formato: 'Frasco', cantidad_total: 0.5, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Lágrimas artificiales', formato: '0,30% Frasco', cantidad_total: 1, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Lágrimas artificiales', formato: '0,70% Frasco', cantidad_total: 1, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Tobramicina', formato: '0,30% mg Frasco', cantidad_total: 1, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Cloranfenicol', formato: '10 ml Frasco', cantidad_total: 2.5, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Muxol Jarabe', formato: '30mg/5ml Frasco 100ml', cantidad_total: 1, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Clorexidina', formato: 'mg Frasco', cantidad_total: 1, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Levodropropizina', formato: '30mg/5ml mg Frasco', cantidad_total: 1, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Bromuro Ipatropio', formato: 'Puff', cantidad_total: 2, procedencia: 'Inventario Inicial' },
  { nombre_medicamento: 'Salbutamol', formato: 'Puff', cantidad_total: 3, procedencia: 'Inventario Inicial' },
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
    Panel.GeneralKit,
    Panel.GeneralInventory,
    Panel.SummaryCesfam,
    Panel.SummaryIndividualStock,
    Panel.AdminApp,
  ],
  [UserRole.Director]: [
    Panel.Dashboard,
    Panel.Residents,
    Panel.GeneralKit,
    Panel.GeneralInventory,
    Panel.SummaryCesfam,
    Panel.SummaryIndividualStock,
  ],
  [UserRole.Tens]: [
    Panel.Dashboard,
    Panel.Residents,
    Panel.GeneralKit,
    Panel.GeneralInventory,
    Panel.SummaryCesfam,
    Panel.SummaryIndividualStock,
  ],
  [UserRole.Visitor]: [
    Panel.Dashboard,
    Panel.Residents,
  ],
};
