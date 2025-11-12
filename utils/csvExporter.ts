import { CheckinRecord, CheckinType } from '../types';

export const exportCheckinsToCSV = (records: CheckinRecord[], filename: string = 'fichajes.csv'): void => {
  if (records.length === 0) {
    alert('No hay registros para exportar.');
    return;
  }

  const headers = ['Hora de Entrada', 'Nombre del Chofer', 'Subcontratista', 'Tournée', 'Uniforme', 'Identifiant', 'Telephone', 'Tipo de Movimiento'];
  const rows = records.map(record => {
    const uniformStatus = record.type === CheckinType.DEPARTURE 
        ? (record.hasUniform ? 'Sí' : 'No') 
        : 'N/A';

    return [
      record.timestamp.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
      record.driver.name,
      record.driver.subcontractor,
      record.driver.tour,
      uniformStatus,
      record.driver.id,
      record.driver.telephone,
      record.type
    ];
  });

  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(',') + '\n' 
    + rows.map(e => e.join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
};
