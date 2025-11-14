import { Driver } from '../types';

// --- ATENCIÓN: DATOS DE EJEMPLO INICIALES ---
const DRIVER_LIST_STORAGE_KEY = 'driverList';

const initialMockDrivers: Driver[] = [
  { id: 'C132132', name: 'Karim Mel', subcontractor: 'BA', plate: '', tour: '', telephone: '+33(0)6.04.14.83.06' },
  { id: 'C068480', name: 'Mohamm', subcontractor: 'BA', plate: '', tour: '9008', telephone: '+33(0)7.69.59.32.94' },
  { id: 'C166317', name: 'Sid ahmed', subcontractor: 'BA', plate: '', tour: '', telephone: '+33(0)6.05.98.45.17' },
  { id: 'C178508', name: 'IDRISS Ab', subcontractor: 'BA', plate: '', tour: '9004', telephone: '+33(0)6.04.14.42.18' },
  { id: 'C333554', name: 'SAID BART', subcontractor: 'BA', plate: '', tour: '9003', telephone: '+33(0)6.50.97.76.40' },
  { id: 'C416861', name: 'TAOURIT E', subcontractor: 'BA', plate: '', tour: '9007', telephone: '+33(0)6.04.09.42.33' },
  { id: 'C552108', name: 'Mustafa A', subcontractor: 'BA', plate: '', tour: '9006', telephone: '+33(0)7.58.90.30.36' },
  { id: 'C582682', name: 'Mohamm', subcontractor: 'BA', plate: '', tour: '', telephone: '+33(0)6.95.79.49.03' },
  { id: 'C552252', name: 'Ibrahim R', subcontractor: 'BA', plate: '', tour: '9002', telephone: '+33(0)6.95.74.09.85' },
  { id: 'C643825', name: 'Mohamm', subcontractor: 'BA', plate: '', tour: '9009', telephone: '+33(0)6.51.41.61.74' },
  { id: 'C711100', name: 'Nicolas A', subcontractor: 'BA', plate: '', tour: '9001', telephone: '+33(0)6.74.66.32.12' },
  { id: 'C711176', name: 'Bloufa BEI', subcontractor: 'BA', plate: '', tour: '', telephone: '+33(0)6.95.43.81.11' },
  { id: 'C735861', name: 'Chaoui Ou', subcontractor: 'BA', plate: '', tour: '', telephone: '+33(0)7.44.24.70.09' },
  { id: 'C903956', name: 'Ilyes Fathi', subcontractor: 'BA', plate: '', tour: '9005', telephone: '+33(0)7.82.13.32.45' },
  { id: 'C595424', name: 'Benichou', subcontractor: 'BA', plate: '', tour: '9005', telephone: '+33(0)7.82.13.32.45' },
  { id: 'C273997', name: 'Maurice M', subcontractor: 'BA', plate: '', tour: '', telephone: '+33(0)6.71.76.24.85' },
  { id: 'C821732', name: 'Naafi Furr', subcontractor: 'BA', plate: '', tour: '', telephone: '+33(0)7.53.38.34.90' },
  { id: 'C950100', name: 'Lotfi Meda', subcontractor: 'M&A', plate: '', tour: '5001', telephone: '+33(0)7.45.92.73.83' },
  { id: 'C708361', name: 'Isak Abral', subcontractor: 'M&A', plate: '', tour: '5002', telephone: '+33(0)7.66.86.39.41' },
  { id: 'C103730', name: 'Yassine Le', subcontractor: 'M&A', plate: '', tour: '5003', telephone: '+33(0)6.59.32.57.45' },
  { id: 'C438291', name: 'DION HIBI', subcontractor: 'M&A', plate: '', tour: '5004', telephone: '+33(0)6.17.27.25.08' },
  { id: 'C776818', name: 'Djafar Mo', subcontractor: 'M&A', plate: '', tour: '5005', telephone: '+33(0)6.05.51.10.31' },
  { id: 'C841047', name: 'Alsadig M', subcontractor: 'M&A', plate: '', tour: '5006', telephone: '+33(0)7.68.79.25.00' },
  { id: 'C429226', name: 'ahmed ali', subcontractor: 'M&A', plate: '', tour: '5004', telephone: '+33(0)7.68.79.25.00' },
  { id: 'C635924', name: 'Maan al k', subcontractor: 'M&A', plate: '', tour: '', telephone: '+33(0)6.42.00.65.02' },
  { id: 'C463722', name: 'Adam Ma', subcontractor: 'M&A', plate: '', tour: '', telephone: '+33(0)7.49.35.93.97' },
  { id: 'C784486', name: 'Mondher', subcontractor: 'M&A', plate: '', tour: '', telephone: '+33(0)7.79.34.74.36' },
  { id: 'C660713', name: 'BAKHRI ID', subcontractor: 'M&A', plate: '', tour: '', telephone: '+33(0)7.49.27.19.39' },
  { id: 'C453596', name: 'Mohamad', subcontractor: 'M&A', plate: '', tour: '', telephone: '+33(0)6.44.04.16.85' },
  { id: 'C467592', name: 'ALI ALLAHI', subcontractor: 'M&A', plate: '', tour: '', telephone: '+33(0)7.86.02.05.29' },
  { id: 'C538202', name: 'Arsen Ava', subcontractor: 'M&A', plate: '', tour: '', telephone: '+33(0)7.49.81.76.03' },
  { id: 'C660713', name: 'IDRISS BAI', subcontractor: 'M&A', plate: '', tour: '', telephone: '+33(0)7.49.27.19.39' },
  { id: 'C810342', name: 'Salim Amr', subcontractor: 'M&A', plate: '', tour: '', telephone: '+33(0)7.45.69.15.99' },
  { id: 'C841047', name: 'Alsadig M', subcontractor: 'M&A', plate: '', tour: '', telephone: '+33(0)7.69.11.44.67' },
  { id: 'C841352', name: 'mohamed', subcontractor: 'M&A', plate: '', tour: '', telephone: '+33(0)7.59.78.96.63' },
  { id: 'C969240', name: 'issam HA', subcontractor: 'M&A', plate: '', tour: '', telephone: '+33(0)7.68.69.60.33' },
  { id: 'C268094', name: 'Hacen Nej', subcontractor: 'TM', plate: '', tour: '', telephone: '+33(0)6.24.14.11.24' },
  { id: 'C118995', name: 'Merakeb M', subcontractor: 'TM', plate: '', tour: '2002', telephone: '+33(0)7.82.61.16.22' },
  { id: 'C818669', name: 'mohamm', subcontractor: 'TM', plate: '', tour: '2001', telephone: '+33(0)6.52.07.93.47' },
  { id: 'C235123', name: 'Arisqui ba', subcontractor: 'Boue', plate: '', tour: '6003', telephone: '+33(0)6.10.65.79.89' },
  { id: 'C998756', name: 'Youssouf', subcontractor: 'Boue', plate: '', tour: '6002', telephone: '+33(0)7.44.20.57.11' },
  { id: 'C092055', name: 'CAMARA M', subcontractor: 'Boue', plate: '', tour: '6001', telephone: '+33(0)7.51.23.16.84' },
  { id: 'C260226', name: 'Diallo Ibra', subcontractor: 'Boue', plate: '', tour: '6004', telephone: '+33(0)6.95.65.07.02' },
  { id: 'C325049', name: 'Yacine Yal', subcontractor: 'Boue', plate: '', tour: '6001', telephone: '+33(0)6.17.67.59.68' },
  { id: 'C385647', name: 'Siham KA', subcontractor: 'Boue', plate: '', tour: '', telephone: '+33(0)7.54.11.02.89' },
  { id: 'C531675', name: 'Kaci boua', subcontractor: 'Boue', plate: '', tour: '', telephone: '+33(0)6.52.22.97.17' },
  { id: 'C172984', name: 'DJIR ABOL', subcontractor: 'Boue', plate: '', tour: '', telephone: '+33(0)6.50.35.85.82' },
  { id: 'C419673', name: 'Ayoub lou', subcontractor: 'Boue', plate: '', tour: '', telephone: '+33(0)7.60.40.46.29' },
  { id: 'C819385', name: 'razik taibi', subcontractor: 'Boue', plate: '', tour: '', telephone: '+33(0)6.21.65.16.12' },
  { id: 'C281563', name: 'Mohamed', subcontractor: 'KARR', plate: '', tour: '7999', telephone: '+33(0)7.51.38.39.59' },
  { id: 'C020697', name: 'Abdelali C', subcontractor: 'KARR', plate: '', tour: '7004', telephone: '+33(0)7.84.56.46.81' },
  { id: 'C304476', name: 'Cyril Barb', subcontractor: 'KARR', plate: '', tour: '7006', telephone: '+33(0)6.44.08.76.17' },
  { id: 'C294104', name: 'karim BEL', subcontractor: 'KARR', plate: '', tour: '7005', telephone: '+33(0)7.80.80.54.81' },
  { id: 'C991824', name: 'Margaux F', subcontractor: 'KARR', plate: '', tour: '7003', telephone: '+33(0)6.20.38.50.31' },
  { id: 'C838770', name: 'Nour El ka', subcontractor: 'KARR', plate: '', tour: '', telephone: '+33(0)6.27.38.87.98' },
  { id: 'C294104', name: 'Ismail Ab', subcontractor: 'KARR', plate: '', tour: '', telephone: '+33(0)7.80.80.54.81' },
  { id: 'C506975', name: 'Rahal Fay', subcontractor: 'KARR', plate: '', tour: '', telephone: '+33(0)6.69.96.85.25' },
  { id: 'C082977', name: 'NASSIM LA', subcontractor: 'PADO', plate: '', tour: '8003', telephone: '+33(0)6.51.19.17.11' },
  { id: 'C080653', name: 'Salim Bec', subcontractor: 'PADO', plate: '', tour: '8007', telephone: '+33(0)7.45.19.74.87' },
  { id: 'C417169', name: 'Rachid M', subcontractor: 'PADO', plate: '', tour: '', telephone: '' },
  { id: 'C118423', name: 'HARIATE A', subcontractor: 'PADO', plate: '', tour: '8005', telephone: '+33(0)7.80.28.49.63' },
  { id: 'C173203', name: 'MOMAN S', subcontractor: 'PADO', plate: '', tour: '', telephone: '+33(0)6.66.83.45.63' },
  { id: 'C189221', name: 'Abdelillah', subcontractor: 'PADO', plate: '', tour: '8002', telephone: '+33(0)6.41.11.94.95' },
  { id: 'C458997', name: 'GUEYE Mo', subcontractor: 'PADO', plate: '', tour: '', telephone: '+33(0)7.66.83.45.63' },
  { id: 'C651830', name: 'Mohamm', subcontractor: 'PADO', plate: '', tour: '', telephone: '+33(0)6.65.24.86.44' },
  { id: 'C898763', name: 'SOUFIANE', subcontractor: 'PADO', plate: '', tour: '8004', telephone: '+33(0)6.60.66.90' },
  { id: 'C949253', name: 'AMID GHA', subcontractor: 'PADO', plate: '', tour: '', telephone: '+33(0)7.58.64.35.45' },
  { id: 'C942414', name: 'Hicham Ki', subcontractor: 'PADO', plate: '', tour: '', telephone: '+33(0)7.80.61.86.69' },
  { id: 'C953340', name: 'Souleyma', subcontractor: 'PADO', plate: '', tour: '8001', telephone: '+33(0)6.51.23.08.81' },
  { id: 'C253285', name: 'Mohamed', subcontractor: 'PADO', plate: '', tour: '', telephone: '+33(0)7.80.37.02.88' },
  { id: 'C376914', name: 'Abdelssal', subcontractor: 'PADO', plate: '', tour: '', telephone: '+33(0)7.80.42.30.01' },
  { id: 'C426258', name: 'Otmane B', subcontractor: 'PADO', plate: '', tour: '', telephone: '+33(0)6.04.16.94.66' },
  { id: 'C976921', name: 'Adel Mera', subcontractor: 'PADO', plate: '', tour: '', telephone: '+33(0)7.53.28.92.13' }
];


const loadDriversFromStorage = (): Driver[] => {
    try {
        const savedDrivers = localStorage.getItem(DRIVER_LIST_STORAGE_KEY);
        if (savedDrivers) {
            return JSON.parse(savedDrivers);
        }
    } catch (error) {
        console.error("Erreur lors du chargement de la liste des chauffeurs depuis le stockage :", error);
    }
    // Si rien n'est sauvegardé, utiliser la liste initiale et la sauvegarder.
    localStorage.setItem(DRIVER_LIST_STORAGE_KEY, JSON.stringify(initialMockDrivers));
    return initialMockDrivers;
};

let drivers: Driver[] = loadDriversFromStorage();

const saveDriversToStorage = (driversToSave: Driver[]): void => {
    try {
        localStorage.setItem(DRIVER_LIST_STORAGE_KEY, JSON.stringify(driversToSave));
        drivers = driversToSave;
    } catch (error) {
        console.error("Erreur lors de la sauvegarde de la liste des chauffeurs :", error);
        throw error;
    }
};


export const driverService = {
  /**
   * Récupère la liste actuelle des chauffeurs.
   */
  fetchDrivers: (): Promise<Driver[]> => {
    drivers = loadDriversFromStorage();
    return Promise.resolve(drivers);
  },

  /**
   * Ajoute un nouveau chauffeur à la liste.
   * @param newDriver Le nouveau chauffeur à ajouter.
   */
  addDriver: (newDriver: Driver): Promise<void> => {
      try {
          const currentDrivers = loadDriversFromStorage();
          if (currentDrivers.some(d => d.id.trim().toLowerCase() === newDriver.id.trim().toLowerCase())) {
              return Promise.reject(new Error(`Un chauffeur avec l'identifiant "${newDriver.id}" existe déjà.`));
          }
          saveDriversToStorage([...currentDrivers, newDriver]);
          return Promise.resolve();
      } catch (error) {
          return Promise.reject(error as Error);
      }
  },

  /**
   * Remplace toute la liste des chauffeurs et la sauvegarde dans le stockage local.
   * @param newDrivers La nouvelle liste complète des chauffeurs.
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
   * Met à jour les données d'un seul chauffeur.
   * @param updatedDriver L'objet chauffeur avec les informations mises à jour.
   */
  updateSingleDriver: (updatedDriver: Driver): Promise<void> => {
      try {
          const driverIndex = drivers.findIndex(d => d.id === updatedDriver.id);
          if (driverIndex === -1) {
              return Promise.reject(new Error("Chauffeur à mettre à jour non trouvé."));
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
   * Supprime un chauffeur de la liste.
   * @param driverId L'ID du chauffeur à supprimer.
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