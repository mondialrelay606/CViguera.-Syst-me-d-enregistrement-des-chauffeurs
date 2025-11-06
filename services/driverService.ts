import { Driver, SubcontractorUser } from '../types';

// --- ATENCIÓN: DATOS DE EJEMPLO ---
// Esta lista se usará solo la primera vez que se inicie la aplicación
// o si no se encuentran datos en el almacenamiento local.
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

const DRIVERS_STORAGE_KEY = 'drivers';

export const driverService = {
  /**
   * Obtiene la lista de choferes.
   * Intenta cargar desde localStorage primero. Si no hay datos,
   * usa la lista de ejemplo y la guarda para futuras sesiones.
   */
  fetchDrivers: (): Promise<Driver[]> => {
    console.log('Obteniendo lista de choferes...');
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const savedDrivers = localStorage.getItem(DRIVERS_STORAGE_KEY);
          if (savedDrivers) {
            console.log('Choferes obtenidos desde localStorage.');
            resolve(JSON.parse(savedDrivers));
          } else {
            console.log('No hay choferes en localStorage. Usando datos de ejemplo y guardando.');
            localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(mockDrivers));
            resolve(mockDrivers);
          }
        } catch (error) {
          console.error('Error al obtener choferes de localStorage, usando datos de ejemplo:', error);
          resolve(mockDrivers); // Fallback to mocks on error
        }
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
