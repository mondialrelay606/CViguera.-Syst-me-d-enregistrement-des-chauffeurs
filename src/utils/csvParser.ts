import { Driver } from '../types';

/**
 * Analyse le contenu d'une chaîne de caractères au format CSV en un tableau d'objets Driver.
 * S'attend à ce que la première ligne soit l'en-tête.
 * @param csvContent Le contenu du fichier CSV sous forme de chaîne de caractères.
 * @returns Un tableau d'objets Driver.
 * @throws Error si le format du CSV est incorrect.
 */
export const parseDriversCSV = (csvContent: string): Driver[] => {
  const lines = csvContent.split(/\r\n|\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) {
    throw new Error("Le fichier CSV doit contenir au moins un en-tête et une ligne de données.");
  }

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const requiredHeaders = ['nom', 'sous-traitant', 'plaque', 'tournée', 'identifiant', 'telephone'];
  const headerIndices: { [key: string]: number } = {};

  requiredHeaders.forEach(reqHeader => {
      const index = header.indexOf(reqHeader);
      if (index === -1) {
          throw new Error(`L'en-tête du CSV ne contient pas la colonne requise : '${reqHeader}'. Les colonnes attendues sont : ${requiredHeaders.join(', ')}`);
      }
      headerIndices[reqHeader] = index;
  });

  const drivers: Driver[] = [];
  for (let i = 1; i < lines.length; i++) {
    const data = lines[i].split(',');
    
    if (data.length >= header.length) {
        const driver: Driver = {
            name: data[headerIndices['nom']]?.trim() || '',
            subcontractor: data[headerIndices['sous-traitant']]?.trim() || '',
            plate: data[headerIndices['plaque']]?.trim() || '',
            tour: data[headerIndices['tournée']]?.trim() || '',
            id: data[headerIndices['identifiant']]?.trim() || '',
            telephone: data[headerIndices['telephone']]?.trim() || '',
        };

        // S'assurer que les champs essentiels ne sont pas vides
        if (driver.id && driver.name && driver.subcontractor) {
             drivers.push(driver);
        }
    }
  }
  return drivers;
};