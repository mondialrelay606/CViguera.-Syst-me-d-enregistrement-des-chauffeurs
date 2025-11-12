import { AttendanceRecord, ReportRow } from '../types';

export const exportActivityLogToCSV = (records: AttendanceRecord[], filename: string = 'fichajes_actividad.csv'): void => {
  if (records.length === 0) {
    alert('No hay registros para exportar.');
    return;
  }

  const headers = ['Fecha Entrada', 'Hora Entrada', 'Fecha Salida', 'Hora Salida', 'Nombre del Chofer', 'Empresa', 'Código de Barras'];
  const rows = records.map(record => [
    record.checkinTime.toLocaleDateString('es-ES'),
    record.checkinTime.toLocaleTimeString('es-ES'),
    record.checkoutTime ? record.checkoutTime.toLocaleDateString('es-ES') : 'DENTRO',
    record.checkoutTime ? record.checkoutTime.toLocaleTimeString('es-ES') : '-',
    record.driver.name,
    record.driver.company,
    record.driver.id
  ].map(field => `"${field}"`)); // Wrap fields in quotes

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


export const exportReportToCSV = (records: ReportRow[], filename: string = 'reporte_asistencia.csv'): void => {
  if (records.length === 0) {
    alert('No hay datos en el reporte para exportar.');
    return;
  }

  const headers = ['Chofer', 'Empresa', 'Entrada', 'Salida', 'Horas Trabajadas'];
  const rows = records.map(record => [
    `"${record.driverName}"`,
    `"${record.driverCompany}"`,
    `"${record.checkinTime}"`,
    `"${record.checkoutTime}"`,
    `"${record.duration}"`,
  ]);

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
}