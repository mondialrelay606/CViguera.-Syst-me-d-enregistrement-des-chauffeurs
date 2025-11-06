import React, { useState, useMemo } from 'react';
import { Driver } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface DriverListProps {
  drivers: Driver[];
  onUpdateDriverRoute: (driverId: string, newRoute: string) => void;
  canEdit?: boolean;
}

const DriverList: React.FC<DriverListProps> = ({ drivers, onUpdateDriverRoute, canEdit = true }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [editingRoute, setEditingRoute] = useState('');

  const handleEdit = (driver: Driver) => {
    setEditingDriverId(driver.id);
    setEditingRoute(driver.route || '');
  };

  const handleCancel = () => {
    setEditingDriverId(null);
    setEditingRoute('');
  };
  
  const handleSave = () => {
    if (editingDriverId) {
      onUpdateDriverRoute(editingDriverId, editingRoute);
      setEditingDriverId(null);
      setEditingRoute('');
    }
  };

  const filteredDrivers = useMemo(() => drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.subcontractor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.vehiclePlate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.route || '').toLowerCase().includes(searchTerm.toLowerCase())
  ), [drivers, searchTerm]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">{t('driverList.title')}</h2>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('general.search')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-sm p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex-grow overflow-y-auto">
        {filteredDrivers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No drivers found.</p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-start text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">{t('driverList.headers.name')}</th>
                  <th scope="col" className="px-6 py-3">{t('driverList.headers.company')}</th>
                  <th scope="col" className="px-6 py-3">{t('driverList.headers.subcontractor')}</th>
                  <th scope="col" className="px-6 py-3">{t('driverList.headers.plate')}</th>
                  <th scope="col" className="px-6 py-3">{t('driverList.headers.route')}</th>
                  <th scope="col" className="px-6 py-3">{t('driverList.headers.id')}</th>
                  {canEdit && <th scope="col" className="px-6 py-3 text-end">{t('driverList.headers.actions')}</th>}
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map(driver => (
                  <tr key={driver.id} className="bg-white/70 border-b border-gray-200/50 hover:bg-gray-50/70">
                    <td className="px-6 py-4 font-medium text-gray-900">{driver.name}</td>
                    <td className="px-6 py-4">{driver.company}</td>
                    <td className="px-6 py-4">{driver.subcontractor || t('general.notAvailable')}</td>
                    <td className="px-6 py-4 font-mono text-xs">{driver.vehiclePlate || t('general.notAvailable')}</td>
                    <td className="px-6 py-4">
                      {editingDriverId === driver.id && canEdit ? (
                        <input
                          type="text"
                          value={editingRoute}
                          onChange={(e) => setEditingRoute(e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded-md"
                          autoFocus
                        />
                      ) : (
                        driver.route || t('general.notAvailable')
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{driver.id}</td>
                    {canEdit && (
                        <td className="px-6 py-4 text-end">
                          {editingDriverId === driver.id ? (
                            <div className="flex items-center justify-end space-x-2">
                               <button onClick={handleSave} className="text-green-600 hover:text-green-900 font-medium">{t('general.save')}</button>
                               <button onClick={handleCancel} className="text-red-600 hover:text-red-900 font-medium">{t('general.cancel')}</button>
                            </div>
                          ) : (
                            <button onClick={() => handleEdit(driver)} className="text-blue-600 hover:text-blue-900 font-medium">{t('general.edit')}</button>
                          )}
                        </td>
                    )}
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