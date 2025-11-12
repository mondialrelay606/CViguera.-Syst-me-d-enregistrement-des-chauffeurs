import { Driver } from '../types';

// --- ATENCIÓN: DATOS DE EJEMPLO ---
// En una aplicación real, esta información vendría de una API
// que se conecta a la base de datos o al sitio web mencionado.
// No es posible acceder directamente a 'https://fast-operations.mondialrelay.int/chauffeurs'
// desde el navegador por razones de seguridad (CORS).
const mockDrivers: Driver[] = [
  { id: 'BC12345678', name: 'Juan Pérez', company: 'Transportes Veloz', vehiclePlate: '1234-ABC' },
  { id: 'BC87654321', name: 'Ana García', company: 'Logística Rápida', vehiclePlate: '5678-DEF' },
  { id: 'BC55566677', name: 'Carlos Sánchez', company: 'Entregas Express', vehiclePlate: '9012-GHI' },
  { id: 'BC99988877', name: 'Laura Martínez', company: 'Mondial Relay', vehiclePlate: '3456-JKL' },
  { id: 'BC11223344', name: 'Pedro Rodríguez', company: 'Transportes Veloz', vehiclePlate: '7890-MNO' },
  { id: 'BC44332211', name: 'Sofía López', company: 'Mondial Relay' },
  { id: 'BC67891234', name: 'David Fernández', company: 'Logística Rápida', vehiclePlate: '1122-PQR' },
  { id: 'BC43219876', name: 'Elena Gómez', company: 'Entregas Express', vehiclePlate: '3344-STU' },
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
};