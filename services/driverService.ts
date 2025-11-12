import { Driver } from '../types';

// --- ATENCIÓN: DATOS DE EJEMPLO INICIALES ---
const DRIVER_LIST_STORAGE_KEY = 'driverList';

const initialMockDrivers: Driver[] = [
  { id: 'BC12345678', name: 'Juan Pérez', company: 'Transportes Veloz', subcontractor: 'Subcontrata A', defaultPlate: '1234-ABC', tour: 'Ruta Mañana 1' },
  { id: 'BC87654321', name: 'Ana García', company: 'Logística Rápida', subcontractor: 'Subcontrata B', defaultPlate: '5678-DEF', tour: 'Ruta Tarde 2' },
  { id: 'BC55566677', name: 'Carlos Sánchez', company: 'Entregas Express', subcontractor: 'Subcontrata A', defaultPlate: '9012-GHI', tour: 'Ruta Mañana 3' },
  { id: 'BC99988877', name: 'Laura Martínez', company: 'Mondial Relay', subcontractor: 'Mondial Relay', defaultPlate: '3456-JKL', tour: 'Ruta Especial' },
  { id: 'BC11223344', name: 'Pedro Rodríguez', company: 'Transportes Veloz', subcontractor: 'Subcontrata C', defaultPlate: '7890-MNO', tour: 'Ruta Mañana 1' },
  { id: 'BC44332211', name: 'Sofía López', company: 'Mondial Relay', subcontractor: 'Mondial Relay', defaultPlate: '1234-PQR', tour: 'Ruta Tarde 4' },
  { id: 'BC67891234', name: 'David Fernández', company: 'Logística Rápida', subcontractor: 'Subcontrata B', defaultPlate: '5678-STU', tour: 'Ruta Noche 5' },
  { id: 'BC43219876', name: 'Elena Gómez', company: 'Entregas Express', subcontractor: 'Subcontrata A', defaultPlate: '9012-VWX', tour: 'Ruta Mañana 3' },
];

const loadDriversFromStorage = (): Driver[] => {
    try {
        const savedDrivers = localStorage.getItem(DRIVER_LIST_STORAGE_KEY);
        if (savedDrivers) {
            return JSON.parse(savedDrivers);
        }
    } catch (error) {
        console.error("Error al cargar la lista de choferes desde el almacenamiento:", error);
    }
    // Si no hay nada guardado, usa la lista inicial y guárdala.
    localStorage.setItem(DRIVER_LIST_STORAGE_KEY, JSON.stringify(initialMockDrivers));
    return initialMockDrivers;
};

let drivers: Driver[] = loadDriversFromStorage();

const saveDriversToStorage = (driversToSave: Driver[]): void => {
    try {
        localStorage.setItem(DRIVER_LIST_STORAGE_KEY, JSON.stringify(driversToSave));
        drivers = driversToSave;
    } catch (error) {
        console.error("Error al guardar la lista de choferes:", error);
        throw error;
    }
};


export const driverService = {
  /**
   * Obtiene la lista actual de choferes.
   */
  fetchDrivers: (): Promise<Driver[]> => {
    drivers = loadDriversFromStorage();
    return Promise.resolve(drivers);
  },

  /**
   * Reemplaza toda la lista de choferes y la guarda en el almacenamiento local.
   * @param newDrivers La nueva lista completa de choferes.
   */
  updateDrivers: (newDrivers: Driver[]): Promise<void> => {
    try {
        saveDriversToStorage(newDrivers);
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
  },

  /**
   * Actualiza los datos de un único chofer.
   * @param updatedDriver El objeto chofer con la información actualizada.
   */
  updateSingleDriver: (updatedDriver: Driver): Promise<void> => {
      try {
          const driverIndex = drivers.findIndex(d => d.id === updatedDriver.id);
          if (driverIndex === -1) {
              return Promise.reject(new Error("No se encontró el chofer para actualizar."));
          }
          const newDrivers = [...drivers];
          newDrivers[driverIndex] = updatedDriver;
          saveDriversToStorage(newDrivers);
          return Promise.resolve();
      } catch (error) {
          return Promise.reject(error);
      }
  },

  /**
   * Elimina un chofer de la lista.
   * @param driverId El ID del chofer a eliminar.
   */
  deleteDriver: (driverId: string): Promise<void> => {
      try {
          const newDrivers = drivers.filter(d => d.id !== driverId);
          saveDriversToStorage(newDrivers);
          return Promise.resolve();
      } catch (error) {
          return Promise.reject(error);
      }
  }
};