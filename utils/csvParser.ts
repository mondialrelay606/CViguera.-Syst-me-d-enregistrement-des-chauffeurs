import { Driver } from '../types';

/**
 * Parsea el contenido de un string en formato CSV a un array de objetos Driver.
 * Espera que la primera línea sea la cabecera.
 * @param csvContent El contenido del archivo CSV como un string.
 * @returns Un array de objetos Driver.
 * @throws Error si el formato del CSV es incorrecto.
 */
export const parseDriversCSV = (csvContent: string): Driver[] => {
  const lines = csvContent.split(/\r\n|\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) {
    throw new Error('El archivo CSV debe contener al menos una cabecera y una fila de datos.');
  }

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const requiredHeaders = ['nom', 'société', 'sous-traitant', 'plaque par déf.', 'tournée', 'id code-barres'];
  const headerIndices: { [key: string]: number } = {};

  requiredHeaders.forEach(reqHeader => {
      const index = header.indexOf(reqHeader);
      if (index === -1) {
          throw new Error(`La cabecera del CSV no contiene la columna requerida: '${reqHeader}'. Las columnas esperadas son: ${requiredHeaders.join(', ')}`);
      }
      headerIndices[reqHeader] = index;
  });

  const drivers: Driver[] = [];
  for (let i = 1; i < lines.length; i++) {
    const data = lines[i].split(',');
    
    if (data.length >= header.length) {
        const driver: Driver = {
            name: data[headerIndices['nom']]?.trim() || '',
            company: data[headerIndices['société']]?.trim() || '',
            subcontractor: data[headerIndices['sous-traitant']]?.trim() || '',
            defaultPlate: data[headerIndices['plaque par déf.']]?.trim() || '',
            tour: data[headerIndices['tournée']]?.trim() || '',
            id: data[headerIndices['id code-barres']]?.trim() || '',
        };

        // Asegurarse de que los campos esenciales no estén vacíos
        if (driver.id && driver.name && driver.company) {
             drivers.push(driver);
        }
    }
  }
  return drivers;
};