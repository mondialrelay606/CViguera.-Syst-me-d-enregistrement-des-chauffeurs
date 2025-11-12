import React from 'react';
import { CheckinRecord, CheckinType } from '../types';
import { exportCheckinsToExcel } from '../utils/excelExporter';


interface CheckinLogProps {
  records: CheckinRecord[];
}

const ExportExcelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 21v-7.5h17.25V21H3.375Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 13.5v-7.5A2.25 2.25 0 0 1 5.625 3.75h12.75c1.24 0 2.25 1.01 2.25 2.25v7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v.008h.008V17.25H9Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25v.008h.008V17.25H12Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17.25v.008h.008V17.25H15Z" />
    </svg>
);


const CheckinLog: React.FC<CheckinLogProps> = ({ records }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Pointages du Jour ({records.length})</h2>
        <button
          onClick={() => exportCheckinsToExcel(records)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center transition-colors"
          disabled={records.length === 0}
        >
          <ExportExcelIcon />
          Exporter Excel
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        {records.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Aucun pointage enregistré aujourd'hui.</p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">Heure</th>
                  <th scope="col" className="px-6 py-3">Nom</th>
                  <th scope="col" className="px-6 py-3">Sous-traitant</th>
                  <th scope="col" className="px-6 py-3">Tournée</th>
                  <th scope="col" className="px-6 py-3">Type</th>
                  <th scope="col" className="px-6 py-3">Tenue</th>
                  <th scope="col" className="px-6 py-3">Commentaire</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {record.timestamp.toLocaleTimeString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">{record.driver.name}</td>
                    <td className="px-6 py-4">{record.driver.subcontractor}</td>
                    <td className="px-6 py-4">{record.driver.tour}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            record.type === CheckinType.DEPARTURE
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                            {record.type}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        {record.type === CheckinType.DEPARTURE
                            ? (record.hasUniform ? 'Oui' : 'Non')
                            : <span className="text-gray-400">N/A</span>
                        }
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 max-w-[200px] truncate" title={record.departureComment}>
                        {record.departureComment || <span className="text-gray-400">---</span>}
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