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

  /**
   * --- SIMULACIÓN DE WEB SCRAPING ---
   * Esta función simula la actualización de la lista de choferes
   * como si estuviera leyendo los datos de la página web.
   * 
   * ¿Por qué es una simulación?
   * Por motivos de seguridad, los navegadores web implementan la política
   * de "Mismo Origen" (Same-Origin Policy), que impide que una página
   * (nuestra app) realice solicitudes de red a un dominio diferente
   * (como mondialrelay.int), a menos que ese dominio lo permita explícitamente.
   * Esto se conoce como CORS (Cross-Origin Resource Sharing).
   * 
   * Para hacer esto en una aplicación real, se necesitaría un servidor
   * backend (un "proxy") que haga el scraping y ofrezca los datos a nuestra
   * aplicación a través de una API.
   * 
   * Para demostrar la funcionalidad, esta función devuelve una lista
   * actualizada después de 1.5 segundos.
   */
  scrapeDrivers: (): Promise<Driver[]> => {
    console.log('[SIMULACIÓN] Iniciando proceso de web scraping...');
    return new Promise((resolve) => {
      setTimeout(() => {
        // Para demostrar el cambio, modificamos la lista original
        const updatedDrivers = [
          ...mockDrivers.map(d => 
            d.id === 'BC87654321' ? { ...d, name: 'Ana García Morales' } : d // Nombre actualizado
          ),
          { id: 'BC24681357', name: 'Ricardo Tormo', company: 'Logística Rápida' } // Nuevo chofer
        ];
        
        console.log('[SIMULACIÓN] Web scraping completado. Nuevos datos:', updatedDrivers);
        resolve(updatedDrivers);
      }, 1500); // Simula 1.5 segundos de scraping
    });
  }
};