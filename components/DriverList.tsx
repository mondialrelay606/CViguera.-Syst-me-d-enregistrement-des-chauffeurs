import React, { useState } from 'react';
import { Driver } from '../types';

interface DriverListProps {
  drivers: Driver[];
}

const SearchIcon = () => (
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
        </svg>
    </div>
);

const DriverList: React.FC<DriverListProps> = ({ drivers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrivers = drivers.filter(driver => {
    const term = searchTerm.toLowerCase();
    return driver.name.toLowerCase().includes(term) ||
           driver.company.toLowerCase().includes(term) ||
           driver.subcontractor.toLowerCase().includes(term) ||
           driver.defaultPlate.toLowerCase().includes(term) ||
           driver.tour.toLowerCase().includes(term) ||
           driver.id.toLowerCase().includes(term);
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
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{driver.name}</td>
                    <td className="px-6 py-4">{driver.company}</td>
                    <td className="px-6 py-4">{driver.subcontractor}</td>
                    <td className="px-6 py-4">{driver.defaultPlate}</td>
                    <td className="px-6 py-4">{driver.tour}</td>
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