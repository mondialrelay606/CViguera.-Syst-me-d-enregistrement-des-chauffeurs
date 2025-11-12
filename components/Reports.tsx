import React, { useState, useMemo } from 'react';
import { Driver, AttendanceRecord, ReportRow } from '../types';
import { exportReportToCSV } from '../utils/csvExporter';

interface ReportsProps {
  drivers: Driver[];
  records: AttendanceRecord[];
}

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
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
    const today = new Date();
    const [startDate, setStartDate] = useState(formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1)));
    const [endDate, setEndDate] = useState(formatDateForInput(today));
    const [selectedDriverId, setSelectedDriverId] = useState('all');

    const reportData: ReportRow[] = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return records
            .filter(rec => rec.checkoutTime) // Only include completed records
            .filter(rec => {
                const checkin = rec.checkinTime.getTime();
                return checkin >= start.getTime() && checkin <= end.getTime();
            })
            .filter(rec => selectedDriverId === 'all' || rec.driver.id === selectedDriverId)
            .map(rec => ({
                driverName: rec.driver.name,
                driverCompany: rec.driver.company,
                checkinTime: rec.checkinTime.toLocaleString('es-ES'),
                checkoutTime: rec.checkoutTime!.toLocaleString('es-ES'),
                duration: calculateDuration(rec.checkinTime, rec.checkoutTime!)
            })).sort((a,b) => new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime());
    }, [records, startDate, endDate, selectedDriverId]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Generar Reporte de Asistencia</h2>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Desde</label>
                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Hasta</label>
                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                </div>
                <div>
                    <label htmlFor="driver" className="block text-sm font-medium text-gray-700">Chofer</label>
                    <select id="driver" value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2">
                        <option value="all">Todos los choferes</option>
                        {drivers.map(driver => (
                            <option key={driver.id} value={driver.id}>{driver.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end mb-4">
                 <button
                    onClick={() => exportReportToCSV(reportData)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center transition-colors disabled:opacity-50"
                    disabled={reportData.length === 0}
                >
                    <ExportIcon />
                    Exportar CSV
                </button>
            </div>

            {/* Report Table */}
            <div className="flex-grow overflow-y-auto">
                {reportData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No hay datos para los filtros seleccionados.</p>
                    </div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Chofer</th>
                                    <th scope="col" className="px-6 py-3">Entrada</th>
                                    <th scope="col" className="px-6 py-3">Salida</th>
                                    <th scope="col" className="px-6 py-3">Horas Trabajadas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((row, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.driverName} <span className="text-gray-500">({row.driverCompany})</span></td>
                                        <td className="px-6 py-4">{row.checkinTime}</td>
                                        <td className="px-6 py-4">{row.checkoutTime}</td>
                                        <td className="px-6 py-4 font-mono text-center">{row.duration}</td>
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