import React, { useState, useMemo } from 'react';
import { AttendanceRecord, ReturnInfo, DailyReportRow } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { exportDailyReportToCSV } from '../utils/csvExporter';

interface DailyReportProps {
  records: AttendanceRecord[];
  returnRecords: ReturnInfo[];
}

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 me-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
);

const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

const DailyReport: React.FC<DailyReportProps> = ({ records, returnRecords }) => {
    const { t } = useTranslation();
    const [selectedDate, setSelectedDate] = useState(formatDateForInput(new Date()));

    const reportData: DailyReportRow[] = useMemo(() => {
        const startOfDay = new Date(`${selectedDate}T00:00:00`);
        const endOfDay = new Date(`${selectedDate}T23:59:59.999`);
        
        const todaysReturnRecords = returnRecords.filter(rr => {
            const recordedAt = new Date(rr.recordedAt);
            return recordedAt >= startOfDay && recordedAt <= endOfDay;
        });

        return todaysReturnRecords.map(rr => {
            const attendanceRecord = records.find(ar => ar.id === rr.attendanceRecordId);
            if (!attendanceRecord) return null;

            return {
                ...rr,
                driverName: attendanceRecord.driver.name,
                driverCompany: attendanceRecord.driver.company,
                driverSubcontractor: attendanceRecord.driver.subcontractor || t('general.notAvailable'),
                checkinTime: attendanceRecord.checkinTime,
                checkoutTime: attendanceRecord.checkoutTime,
            };
        }).filter((row): row is DailyReportRow => row !== null)
          .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());

    }, [selectedDate, returnRecords, records, t]);

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-bold text-slate-700 mb-4">{t('adminPanel.dailyReport.title')}</h2>
            
            <div className="flex justify-between items-center mb-6 p-4 border border-slate-200/60 rounded-lg bg-slate-50/70">
                <div className="flex items-center space-x-2">
                    <label htmlFor="reportDate" className="block text-sm font-medium text-slate-700">{t('adminPanel.dailyReport.dateLabel')}</label>
                    <input type="date" id="reportDate" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="block rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                </div>
                <button
                    onClick={() => exportDailyReportToCSV(reportData, t)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center transition-colors disabled:opacity-50 text-sm font-medium"
                    disabled={reportData.length === 0}
                >
                    <ExportIcon />
                    {t('general.exportCsv')}
                </button>
            </div>

            <div className="flex-grow overflow-y-auto border border-slate-200/60 rounded-lg">
                {reportData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>{t('adminPanel.dailyReport.noData')}</p>
                    </div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-start text-slate-600">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 table-fixed-header">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('export.headers.driverName')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('export.headers.checkoutTime')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('export.headers.recordedAt')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('export.headers.closedRelais')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold text-center">{t('export.headers.unidentifiedPackages')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold text-center">{t('export.headers.undeliveredPackages')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('export.headers.saturatedLockers')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('export.headers.notes')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {reportData.map((row, index) => (
                                    <tr key={row.attendanceRecordId} className={`border-b border-slate-200/60 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{row.driverName} <span className="text-slate-500 text-xs">({row.driverSubcontractor})</span></td>
                                        <td className="px-6 py-4">{row.checkoutTime ? row.checkoutTime.toLocaleTimeString('es-ES') : '-'}</td>
                                        <td className="px-6 py-4">{row.recordedAt.toLocaleTimeString('es-ES')}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{row.closedRelays || '-'}</td>
                                        <td className="px-6 py-4 text-center font-semibold">{row.unidentifiedPackages}</td>
                                        <td className="px-6 py-4 text-center font-semibold">{row.undeliveredPackages}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{row.saturatedLockers || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={row.notes}>{row.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyReport;