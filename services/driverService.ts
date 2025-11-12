import { Driver, SubcontractorUser } from '../types';

// --- ATENCIÓN: DATOS DE EJEMPLO ---
// En una aplicación real, esta información vendría de una API
// que se conecta a la base de datos o al sitio web mencionado.
// No es posible acceder directamente a 'https://fast-operations.mondialrelay.int/chauffeurs'
// desde el navegador por razones de seguridad (CORS).
const mockDrivers: Driver[] = [
  { id: 'BC12345678', name: 'Juan Pérez', company: 'Transportes Veloz', subcontractor: 'Subcontrata A', vehiclePlate: '1234-ABC', route: 'Ruta Norte' },
  { id: 'BC87654321', name: 'Ana García', company: 'Logística Rápida', subcontractor: 'Subcontrata B', vehiclePlate: '5678-DEF', route: 'Ruta Sur' },
  { id: 'BC55566677', name: 'Carlos Sánchez', company: 'Entregas Express', subcontractor: 'Subcontrata C', vehiclePlate: '9012-GHI', route: 'Ruta Este' },
  { id: 'BC99988877', name: 'Laura Martínez', company: 'Mondial Relay', subcontractor: 'Interno', vehiclePlate: '3456-JKL', route: 'Ruta Oeste' },
  { id: 'BC11223344', name: 'Pedro Rodríguez', company: 'Transportes Veloz', subcontractor: 'Subcontrata A', vehiclePlate: '7890-MNO', route: 'Ruta Norte' },
  { id: 'BC44332211', name: 'Sofía López', company: 'Mondial Relay', subcontractor: 'Interno', route: 'Ruta Centro' },
  { id: 'BC67891234', name: 'David Fernández', company: 'Logística Rápida', subcontractor: 'Subcontrata B', vehiclePlate: '1122-PQR', route: 'Ruta Sur' },
  { id: 'BC43219876', name: 'Elena Gómez', company: 'Entregas Express', subcontractor: 'Subcontrata C', vehiclePlate: '3344-STU', route: 'Ruta Este' },
];

const mockSubcontractorUsers: SubcontractorUser[] = [
  { username: 'suba', password: 'passworda', companyName: 'Subcontrata A' },
  { username: 'subb', password: 'passwordb', companyName: 'Subcontrata B' },
  { username: 'subc', password: 'passwordc', companyName: 'Subcontrata C' },
];


export const driverService = {
  /**
   * Simula la obtención de la lista de choferes.
   * La función devuelve una promesa que se resuelve con la lista de choferes
   * después de un breve retraso para imitar una llamada de red.
   */
  fetchDrivers: (): Promise<Driver[]> => {
    console.log('Obteniendo lista de choferes (simulado)...');
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Choferes obtenidos:', mockDrivers);
        resolve(mockDrivers);
      }, 500); // Simula 0.5 segundos de latencia de red
    });
  },
  
  fetchSubcontractorUsers: (): Promise<SubcontractorUser[]> => {
    console.log('Obteniendo lista de usuarios de subcontratas (simulado)...');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockSubcontractorUsers);
      }, 500);
    });
  }
};
