import React, { useState } from 'react';
import { Driver, AttendanceRecord } from '../types';

interface DriverDashboardProps {
    driver: Driver;
    records: AttendanceRecord[];
    onUpdatePlate: (driverId: string, newPlate: string) => void;
    onLogout: () => void;
}

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const DriverDashboard: React.FC<DriverDashboardProps> = ({ driver, records, onUpdatePlate, onLogout }) => {
    const [vehiclePlate, setVehiclePlate] = useState(driver.vehiclePlate || '');
    const [isEditing, setIsEditing] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');

    const driverRecords = records.filter(rec => rec.driver.id === driver.id);

    const handleUpdateClick = () => {
        onUpdatePlate(driver.id, vehiclePlate);
        setIsEditing(false);
        setUpdateMessage('¡Matrícula actualizada con éxito!');
        setTimeout(() => setUpdateMessage(''), 3000); // El mensaje desaparece después de 3 segundos
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {driver.name}</h1>
                        <p className="text-lg text-gray-600">{driver.company}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center transition-colors"
                    >
                        <LogoutIcon />
                        Cerrar Sesión
                    </button>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Sección de Vehículo */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Mi Vehículo</h2>
                        <div className="space-y-3">
                            <label htmlFor="vehicle-plate" className="block text-sm font-medium text-gray-700">
                                Matrícula (por defecto)
                            </label>
                             <div className="flex items-center space-x-2">
                                <input
                                    id="vehicle-plate"
                                    type="text"
                                    value={vehiclePlate}
                                    onChange={(e) => { setVehiclePlate(e.target.value); setIsEditing(true); }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Sin matrícula registrada"
                                />
                                {isEditing && (
                                    <button
                                        onClick={handleUpdateClick}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                                    >
                                        Actualizar
                                    </button>
                                )}
                            </div>
                            {updateMessage && <p className="text-sm text-green-600 mt-2">{updateMessage}</p>}
                        </div>
                    </div>

                    {/* Historial de Fichajes */}
                    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Mi Historial de Fichajes</h2>
                        <div className="max-h-96 overflow-y-auto">
                             {driverRecords.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500 py-10">
                                    <p>No tienes registros de fichajes.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Fecha</th>
                                            <th scope="col" className="px-6 py-3">Matrícula</th>
                                            <th scope="col" className="px-6 py-3">Hora Entrada</th>
                                            <th scope="col" className="px-6 py-3">Hora Salida</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {driverRecords.map((record, index) => (
                                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {record.checkinTime.toLocaleDateString('es-ES')}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs">{record.vehiclePlate || '---'}</td>
                                                <td className="px-6 py-4 text-green-600 font-semibold">
                                                    {record.checkinTime.toLocaleTimeString('es-ES')}
                                                </td>
                                                <td className="px-6 py-4 text-red-600 font-semibold">
                                                    {record.checkoutTime ? record.checkoutTime.toLocaleTimeString('es-ES') : '---'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DriverDashboard;