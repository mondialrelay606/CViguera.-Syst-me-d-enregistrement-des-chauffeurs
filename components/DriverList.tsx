import React, { useState } from 'react';
import { Driver } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface DriverListProps {
  drivers: Driver[];
  onSync: () => void;
  isSyncing: boolean;
}

const SearchIcon = () => (
    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
        </svg>
    </div>
);

const SyncIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 me-2 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001a10.5 10.5 0 0 0-9.348-9.348c-.992 0-1.983.102-2.94.303m-3.038 3.038A10.5 10.5 0 0 0 3.75 9.348v4.992m3.038 3.038a10.5 10.5 0 0 0 9.348 9.348c.992 0 1.983-.102 2.94-.303m-3.038-3.038A10.5 10.5 0 0 0 16.023 9.348" />
    </svg>
);


const DriverList: React.FC<DriverListProps> = ({ drivers, onSync, isSyncing }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">{t('driverList.title', { count: drivers.length })}</h2>
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="bg-gray-700 text-white px-3 py-2 text-sm rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center transition-colors disabled:opacity-50 disabled:bg-gray-500"
        >
          <SyncIcon className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? t('driverList.syncingButton') : t('driverList.syncButton')}
        </button>
      </div>
      <div className="mb-4 relative">
        <SearchIcon />
        <input
          type="text"
          placeholder={t('driverList.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full ps-10 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex-grow overflow-y-auto">
        {filteredDrivers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>{t('driverList.noResults')}</p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-start text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">{t('driverList.headers.name')}</th>
                  <th scope="col" className="px-6 py-3">{t('driverList.headers.company')}</th>
                  <th scope="col" className="px-6 py-3">{t('driverList.headers.code')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="bg-white/70 border-b border-gray-200/50 hover:bg-gray-50/70">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{driver.name}</td>
                    <td className="px-6 py-4">{driver.company}</td>
                    <td className="px-6 py-4 text-xs font-mono">{driver.id}</td>
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

export default DriverList;