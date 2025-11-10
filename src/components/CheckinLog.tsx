import React from 'react';
import { AttendanceRecord } from '../types';
import { exportActivityLogToCSV } from '../utils/csvExporter';
import { useTranslation } from '../contexts/LanguageContext';

interface CheckinLogProps {
  records: AttendanceRecord[];
}

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 me-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
);


const CheckinLog: React.FC<CheckinLogProps> = ({ records }) => {
  const { t } = useTranslation();
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-700">{t('checkinLog.title', { count: records.length })}</h2>
        <button
          onClick={() => exportActivityLogToCSV(records, t)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={records.length === 0}
        >
          <ExportIcon />
          {t('general.exportCsv')}
        </button>
      </div>
      <div className="flex-grow overflow-y-auto border border-slate-200/60 rounded-lg">
        {records.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>{t('checkinLog.noRecords')}</p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-start text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100 table-fixed-header">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">{t('checkinLog.headers.name')}</th>
                  <th scope="col" className="px-6 py-3 font-semibold">{t('checkinLog.headers.company')}</th>
                  <th scope="col" className="px-6 py-3 font-semibold">{t('checkinLog.headers.subcontractor')}</th>
                  <th scope="col" className="px-6 py-3 font-semibold">{t('checkinLog.headers.route')}</th>
                  <th scope="col" className="px-6 py-3 font-semibold">{t('checkinLog.headers.plate')}</th>
                  <th scope="col" className="px-6 py-3 font-semibold">{t('checkinLog.headers.checkin')}</th>
                  <th scope="col" className="px-6 py-3 font-semibold">{t('checkinLog.headers.checkout')}</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {records.map((record, index) => (
                  <tr key={record.id} className={`border-b border-slate-200/60 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      {record.driver.name}
                    </td>
                    <td className="px-6 py-4">{record.driver.company}</td>
                    <td className="px-6 py-4">{record.driver.subcontractor || t('general.notAvailable')}</td>
                    <td className="px-6 py-4">{record.driver.route || t('general.notAvailable')}</td>
                    <td className="px-6 py-4 font-mono text-xs">{record.vehiclePlate || t('general.notAvailable')}</td>
                    <td className="px-6 py-4 font-medium text-green-600">
                      {record.checkinTime.toLocaleTimeString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      {record.checkoutTime ? (
                         <span className="font-medium text-red-600">{record.checkoutTime.toLocaleTimeString('es-ES')}</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('checkinLog.status.inside')}
                        </span>
                      )}
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

export default CheckinLog;
