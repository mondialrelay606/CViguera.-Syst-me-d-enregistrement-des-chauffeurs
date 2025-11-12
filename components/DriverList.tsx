import React, { useState } from 'react';
import { Driver } from '../types';

interface DriverListProps {
  drivers: Driver[];
  onUpdateDriver: (driver: Driver) => void;
  onDeleteDriver: (driverId: string) => void;
}

const SearchIcon = () => (
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
        </svg>
    </div>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const CancelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);


const DriverList: React.FC<DriverListProps> = ({ drivers, onUpdateDriver, onDeleteDriver }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState({ defaultPlate: '', tour: '' });

  const handleEditClick = (driver: Driver) => {
    setEditingDriverId(driver.id);
    setEditedData({ defaultPlate: driver.defaultPlate, tour: driver.tour });
  };

  const handleCancelClick = () => {
    setEditingDriverId(null);
  };

  const handleSaveClick = (originalDriver: Driver) => {
    onUpdateDriver({
        ...originalDriver,
        defaultPlate: editedData.defaultPlate.trim(),
        tour: editedData.tour.trim(),
    });
    setEditingDriverId(null);
  };

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const filteredDrivers = drivers.filter(driver => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(driver).some(value => 
        String(value).toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Lista de Choferes ({drivers.length})</h2>
      <div className="mb-4 relative">
        <SearchIcon />
        <input
          type="text"
          placeholder="Buscar por cualquier campo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex-grow overflow-y-auto">
        {filteredDrivers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No se encontraron choferes.</p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">Nombre</th>
                  <th scope="col" className="px-6 py-3">Empresa</th>
                  <th scope="col" className="px-6 py-3">Subcontratista</th>
                  <th scope="col" className="px-6 py-3">Matrícula por Def.</th>
                  <th scope="col" className="px-6 py-3">Tournée</th>
                  <th scope="col" className="px-6 py-3">Código de Barras</th>
                  <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver) => {
                  const isEditing = editingDriverId === driver.id;
                  return (
                    <tr key={driver.id} className={`bg-white border-b hover:bg-gray-50 ${isEditing ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">{driver.name}</td>
                      <td className="px-6 py-2">{driver.company}</td>
                      <td className="px-6 py-2">{driver.subcontractor}</td>
                      <td className="px-6 py-2">
                        {isEditing ? (
                          <input
                            type="text"
                            name="defaultPlate"
                            value={editedData.defaultPlate}
                            onChange={handleDataChange}
                            className="w-full p-1 border border-blue-300 rounded-md"
                          />
                        ) : (
                          driver.defaultPlate
                        )}
                      </td>
                      <td className="px-6 py-2">
                        {isEditing ? (
                          <input
                            type="text"
                            name="tour"
                            value={editedData.tour}
                            onChange={handleDataChange}
                            className="w-full p-1 border border-blue-300 rounded-md"
                          />
                        ) : (
                          driver.tour
                        )}
                      </td>
                      <td className="px-6 py-2 text-xs font-mono">{driver.id}</td>
                      <td className="px-6 py-2">
                        <div className="flex items-center justify-center space-x-2">
                          {isEditing ? (
                            <>
                              <button onClick={() => handleSaveClick(driver)} className="text-green-600 hover:text-green-800" title="Guardar">
                                <SaveIcon />
                              </button>
                              <button onClick={handleCancelClick} className="text-gray-600 hover:text-gray-800" title="Cancelar">
                                <CancelIcon />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditClick(driver)} className="text-blue-600 hover:text-blue-800" title="Editar">
                                <EditIcon />
                              </button>
                              <button onClick={() => onDeleteDriver(driver.id)} className="text-red-600 hover:text-red-800" title="Eliminar">
                                <DeleteIcon />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverList;