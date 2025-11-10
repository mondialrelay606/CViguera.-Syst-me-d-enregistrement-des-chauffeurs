import React, { useState, useMemo } from 'react';
import { Driver, AttendanceRecord, ReportRow } from '../types';
import { exportReportToCSV } from '../utils/csvExporter';
import { useTranslation } from '../contexts/LanguageContext';

interface ReportsProps {
  drivers: Driver[];
  records: AttendanceRecord[];
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

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

const calculateDuration = (start: Date, end: Date): string => {
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
}

const Reports: React.FC<ReportsProps> = ({ drivers, records }) => {
    const { t, language } = useTranslation();
    const today = new Date();
    const [startDate, setStartDate] = useState(formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1)));
    const [endDate, setEndDate] = useState(formatDateForInput(today));
    const [selectedDriverId, setSelectedDriverId] = useState('all');

    const reportData: ReportRow[] = useMemo(() => {
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59.999`);

        return records
            .filter(rec => rec.checkoutTime)
            .filter(rec => {
                const checkin = rec.checkinTime;
                return checkin >= start && checkin <= end;
            })
            .filter(rec => selectedDriverId === 'all' || rec.driver.id === selectedDriverId)
            .sort((a, b) => b.checkinTime.getTime() - a.checkinTime.getTime())
            .map(rec => ({
                driverName: rec.driver.name,
                driverCompany: rec.driver.company,
                driverSubcontractor: rec.driver.subcontractor || t('general.notAvailable'),
                checkinTime: rec.checkinTime.toLocaleString(language),
                checkoutTime: rec.checkoutTime!.toLocaleString(language),
                duration: calculateDuration(rec.checkinTime, rec.checkoutTime!),
                vehiclePlate: rec.vehiclePlate || t('general.notAvailable'),
                route: rec.driver.route || t('general.notAvailable'),
                uniformVerified: rec.uniformVerified ? t('general.yes') : t('general.no'),
            }));
    }, [records, startDate, endDate, selectedDriverId, language, t]);

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-bold text-slate-700 mb-4">{t('reports.title')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border border-slate-200/60 rounded-lg bg-slate-50/70">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">{t('reports.filters.from')}</label>
                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">{t('reports.filters.to')}</label>
                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                </div>
                <div>
                    <label htmlFor="driver" className="block text-sm font-medium text-slate-700">{t('reports.filters.driver')}</label>
                    <select id="driver" value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2">
                        <option value="all">{t('reports.filters.allDrivers')}</option>
                        {drivers.map(driver => (
                            <option key={driver.id} value={driver.id}>{driver.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end mb-4">
                 <button
                    onClick={() => exportReportToCSV(reportData, t)}
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
                        <p>{t('reports.noData')}</p>
                    </div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-start text-slate-600">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 table-fixed-header">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('reports.headers.driver')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('reports.headers.subcontractor')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('reports.headers.route')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('reports.headers.plate')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('reports.headers.checkin')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('reports.headers.checkout')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('reports.headers.hours')}</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">{t('reports.headers.uniformVerified')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {reportData.map((row, index) => (
                                    <tr key={index} className={`border-b border-slate-200/60 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{row.driverName} <span className="text-slate-500">({row.driverCompany})</span></td>
                                        <td className="px-6 py-4">{row.driverSubcontractor}</td>
                                        <td className="px-6 py-4">{row.route}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{row.vehiclePlate}</td>
                                        <td className="px-6 py-4">{row.checkinTime}</td>
                                        <td className="px-6 py-4">{row.checkoutTime}</td>
                                        <td className="px-6 py-4 font-mono text-center">{row.duration}</td>
                                        <td className={`px-6 py-4 text-center font-semibold`}>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.uniformVerified === t('general.yes') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {row.uniformVerified}
                                            </span>
                                        </td>
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

export default Reports;