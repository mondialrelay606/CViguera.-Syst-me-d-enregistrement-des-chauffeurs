import { AttendanceRecord, ReportRow, DailyReportRow } from '../types';

type Translator = (key: string, values?: { [key: string]: string | number }) => string;

/**
 * Escapa un campo para su uso en un archivo CSV.
 * Envuelve el campo entre comillas dobles y escapa cualquier comilla doble interna.
 * @param field El valor del campo a escapar.
 */
const escapeCsvField = (field: any): string => {
  const stringField = String(field ?? ''); // Maneja null/undefined
  const escapedField = stringField.replace(/"/g, '""');
  return `"${escapedField}"`;
};


export const exportActivityLogToCSV = (records: AttendanceRecord[], t: Translator, filename: string = 'fichajes_actividad.csv'): void => {
  if (records.length === 0) {
    alert(t('export.noActivity'));
    return;
  }

  const headers = [
    t('export.headers.checkinDate'),
    t('export.headers.checkinTime'),
    t('export.headers.checkoutDate'),
    t('export.headers.checkoutTime'),
    t('export.headers.driverName'),
    t('export.headers.company'),
    t('export.headers.subcontractor'),
    t('export.headers.route'),
    t('export.headers.barcode'),
    t('export.headers.plate')
  ];
  
  const rows = records.map(record => [
    record.checkinTime.toLocaleDateString('es-ES'),
    record.checkinTime.toLocaleTimeString('es-ES'),
    record.checkoutTime ? record.checkoutTime.toLocaleDateString('es-ES') : t('checkinLog.status.inside').toUpperCase(),
    record.checkoutTime ? record.checkoutTime.toLocaleTimeString('es-ES') : '-',
    record.driver.name,
    record.driver.company,
    record.driver.subcontractor || '',
    record.driver.route || '',
    record.driver.id,
    record.vehiclePlate || ''
  ].map(escapeCsvField)); // Usar el helper para escapar

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF" // BOM para Excel
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


export const exportReportToCSV = (records: ReportRow[], t: Translator, filename: string = 'reporte_asistencia.csv'): void => {
  if (records.length === 0) {
    alert(t('export.noReportData'));
    return;
  }

  const headers = [
    t('export.headers.driver'),
    t('export.headers.company'),
    t('export.headers.subcontractor'),
    t('export.headers.route'),
    t('export.headers.checkin'),
    t('export.headers.checkout'),
    t('export.headers.hoursWorked'),
    t('export.headers.plate'),
    t('export.headers.uniformVerified')
  ];
  
  const rows = records.map(record => [
    record.driverName,
    record.driverCompany,
    record.driverSubcontractor,
    record.route,
    record.checkinTime,
    record.checkoutTime,
    record.duration,
    record.vehiclePlate,
    record.uniformVerified,
  ].map(escapeCsvField));

  let csvContent = "data:text/csv;charset=utf-t,\uFEFF" // BOM para Excel
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

export const exportDailyReportToCSV = (records: DailyReportRow[], t: Translator, filename: string = 'reporte_diario_retornos.csv'): void => {
  if (records.length === 0) {
    alert(t('export.noDailyReportData'));
    return;
  }

  const headers = [
    t('export.headers.driverName'),
    t('export.headers.company'),
    t('export.headers.subcontractor'),
    t('export.headers.checkoutTime'),
    t('export.headers.recordedAt'),
    t('export.headers.closedRelais'),
    t('export.headers.unidentifiedPackages'),
    t('export.headers.undeliveredPackages'),
    t('export.headers.saturatedLockers'),
    t('export.headers.notes')
  ];

  const rows = records.map(record => [
    record.driverName,
    record.driverCompany,
    record.driverSubcontractor,
    record.checkoutTime ? record.checkoutTime.toLocaleTimeString('es-ES') : '-',
    record.recordedAt.toLocaleString('es-ES'),
    record.closedRelays,
    record.unidentifiedPackages,
    record.undeliveredPackages,
    record.saturatedLockers,
    record.notes || ''
  ].map(escapeCsvField));

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF" // BOM para Excel
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
