import React, { useState, useMemo } from 'react';
import { CheckinRecord, DailyStats, Driver, CheckinType } from '../../types';
import { exportCheckinsToCSV } from '../../utils/csvExporter';
import { parseDriversCSV } from '../../utils/csvParser';
import { calculateDailyStats, getHourlyDistribution } from '../../utils/reporting';
import SummaryCard from './SummaryCard';
import HourlyCheckinChart from './HourlyCheckinChart';
import DriverList from '../DriverList';

interface AdminDashboardProps {
  allRecords: CheckinRecord[];
  allDrivers: Driver[];
  onLogout: () => void;
  onUpdateDrivers: (newDrivers: Driver[]) => void;
  onUpdateSingleDriver: (driver: Driver) => void;
  onDeleteDriver: (driverId: string) => void;
}

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ allRecords, allDrivers, onLogout, onUpdateDrivers, onUpdateSingleDriver, onDeleteDriver }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'drivers'>('stats');

  const dailyStats = useMemo(() => calculateDailyStats(allRecords), [allRecords]);
  const hourlyData = useMemo(() => getHourlyDistribution(allRecords), [allRecords]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return allRecords;
    const lowercasedFilter = searchTerm.toLowerCase();
    return allRecords.filter(record => {
      const uniformText = record.type === CheckinType.DEPARTURE ? (record.hasUniform ? 'sí' : 'no') : '';
      return record.driver.name.toLowerCase().includes(lowercasedFilter) ||
        record.driver.company.toLowerCase().includes(lowercasedFilter) ||
        record.driver.tour.toLowerCase().includes(lowercasedFilter) ||
        record.timestamp.toLocaleString('es-ES').includes(lowercasedFilter) ||
        record.type.toLowerCase().includes(lowercasedFilter) ||
        uniformText.includes(lowercasedFilter);
    });
  }, [allRecords, searchTerm]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
            const newDrivers = parseDriversCSV(text);
            if (newDrivers.length > 0) {
                onUpdateDrivers(newDrivers);
            } else {
                alert("El archivo CSV está vacío o tiene un formato incorrecto.");
            }
        } catch (error) {
            console.error("Error al parsear el CSV:", error);
            alert(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center transition-colors"
        >
          <LogoutIcon />
          Volver al Kiosko
        </button>
      </header>
      
      <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                  onClick={() => setActiveTab('stats')}
                  className={`${activeTab === 'stats' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
              >
                  Estadísticas y Fichajes
              </button>
              <button
                  onClick={() => setActiveTab('drivers')}
                  className={`${activeTab === 'drivers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
              >
                  Gestión de Choferes
              </button>
          </nav>
      </div>

      <main>
        <div className={activeTab === 'stats' ? 'block' : 'hidden'}>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <SummaryCard title="Fichajes Totales (Hoy)" value={dailyStats.totalCheckins.toString()} />
              <SummaryCard title="Choferes Únicos (Hoy)" value={dailyStats.uniqueDrivers.toString()} />
              <SummaryCard title="Hora Punta (Hoy)" value={dailyStats.busiestHour} />
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Actividad por Hora</h2>
                <HourlyCheckinChart data={hourlyData} />
              </div>
              <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow-md flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                  <h2 className="text-xl font-bold text-gray-700">Historial de Fichajes ({filteredRecords.length})</h2>
                  <button
                    onClick={() => exportCheckinsToCSV(allRecords, `historial_fichajes_${new Date().toISOString().split('T')[0]}.csv`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center transition-colors w-full sm:w-auto"
                    disabled={allRecords.length === 0}
                  >
                    Exportar Historial
                  </button>
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, empresa, tournée, tipo, uniforme, fecha..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex-grow overflow-y-auto h-96">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Fecha y Hora</th>
                                <th scope="col" className="px-6 py-3">Nombre</th>
                                <th scope="col" className="px-6 py-3">Empresa</th>
                                <th scope="col" className="px-6 py-3">Tournée</th>
                                <th scope="col" className="px-6 py-3">Tipo</th>
                                <th scope="col" className="px-6 py-3">Uniforme</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map((record, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {record.timestamp.toLocaleString('es-ES')}
                                </td>
                                <td className="px-6 py-4">{record.driver.name}</td>
                                <td className="px-6 py-4">{record.driver.company}</td>
                                <td className="px-6 py-4">{record.driver.tour}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ record.type === CheckinType.DEPARTURE ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800' }`}>
                                        {record.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {record.type === CheckinType.DEPARTURE
                                        ? (record.hasUniform ? 'Sí' : 'No')
                                        : <span className="text-gray-400">N/A</span>
                                    }
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRecords.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No se encontraron registros que coincidan con la búsqueda.</p>
                        </div>
                    )}
                </div>
              </div>
            </div>
        </div>

        <div className={activeTab === 'drivers' ? 'block' : 'hidden'}>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Actualizar Lista de Choferes</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Sube un archivo en formato CSV para reemplazar la lista actual. El archivo debe tener las columnas: <code className="bg-gray-200 text-sm p-1 rounded">Nom,Société,Sous-traitant,Plaque par déf.,Tournée,ID Code-barres</code>.
                </p>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>
            <div className="h-[600px]">
                <DriverList 
                  drivers={allDrivers} 
                  onUpdateDriver={onUpdateSingleDriver}
                  onDeleteDriver={onDeleteDriver}
                />
            </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
