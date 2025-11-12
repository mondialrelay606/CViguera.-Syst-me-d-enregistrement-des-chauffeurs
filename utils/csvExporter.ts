import { AttendanceRecord, ReportRow } from '../types';

type Translator = (key: string) => string;

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
    record.driver.id,
    record.vehiclePlate || ''
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


export const exportReportToCSV = (records: ReportRow[], t: Translator, filename: string = 'reporte_asistencia.csv'): void => {
  if (records.length === 0) {
    alert(t('export.noReportData'));
    return;
  }

  const headers = [
    t('export.headers.driver'),
    t('export.headers.company'),
    t('export.headers.checkin'),
    t('export.headers.checkout'),
    t('export.headers.hoursWorked'),
    t('export.headers.plate')
  ];
  
  const rows = records.map(record => [
    `"${record.driverName}"`,
    `"${record.driverCompany}"`,
    `"${record.checkinTime}"`,
    `"${record.checkoutTime}"`,
    `"${record.duration}"`,
    `"${record.vehiclePlate}"`,
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