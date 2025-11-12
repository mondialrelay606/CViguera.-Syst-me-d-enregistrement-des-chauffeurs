import React, { useState, useEffect, useRef } from 'react';
// FIX: Aliased the `ScanResult` type to `ScanResultType` to resolve the name collision with the `ScanResult` component.
import { Driver, CheckinRecord, ScanStatus, type ScanResult as ScanResultType } from './types';
import { driverService } from './services/driverService';
import Clock from './components/Clock';
import ScanResult from './components/ScanResult';
import CheckinLog from './components/CheckinLog';
import DriverList from './components/DriverList';

const BarcodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 0 1 4.5 3.75h15a.75.75 0 0 1 .75.75v15a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75v-15Zm.75 0v15h13.5v-15h-13.5ZM8.25 6h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Z" />
    </svg>
);


const App: React.FC = () => {
    const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
    const [checkinLog, setCheckinLog] = useState<CheckinRecord[]>([]);
    const [barcode, setBarcode] = useState('');
    // FIX: Used the `ScanResultType` alias for the state's type annotation.
    const [lastScanResult, setLastScanResult] = useState<ScanResultType>({ status: ScanStatus.IDLE, message: '' });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'log' | 'drivers'>('log');
    
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadDrivers = async () => {
            try {
                const drivers = await driverService.fetchDrivers();
                setAllDrivers(drivers);
            } catch (error) {
                console.error("Error al cargar los choferes:", error);
                setLastScanResult({ status: ScanStatus.ERROR, message: 'No se pudo cargar la lista de choferes.' });
            } finally {
                setLoading(false);
            }
        };
        loadDrivers();
        // Focus the input on mount
        barcodeInputRef.current?.focus();
    }, []);

    const handleScan = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!barcode.trim()) return;

        const foundDriver = allDrivers.find(driver => driver.id === barcode.trim());

        if (foundDriver) {
            const newRecord: CheckinRecord = {
                driver: foundDriver,
                timestamp: new Date()
            };
            setCheckinLog(prevLog => [newRecord, ...prevLog]);
            setLastScanResult({ status: ScanStatus.SUCCESS, message: `Bienvenido, ${foundDriver.name} de ${foundDriver.company}.` });
        } else {
            setLastScanResult({ status: ScanStatus.ERROR, message: `Código de barras "${barcode}" no encontrado. Verifique al chofer.` });
        }
        setBarcode('');
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col">
            <header className="mb-6 text-center">
                <h1 className="text-4xl font-bold text-gray-800">Sistema de Fichaje de Choferes</h1>
                <p className="text-lg text-gray-600">Registro de entradas por código de barras</p>
            </header>
            <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna Izquierda: Escaneo y Reloj */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center space-y-8">
                    <Clock />
                    <div className="w-full max-w-md mx-auto">
                        <form onSubmit={handleScan}>
                            <label htmlFor="barcode-input" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                Escanee el código de barras del chofer
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <BarcodeIcon />
                                </div>
                                <input
                                    ref={barcodeInputRef}
                                    id="barcode-input"
                                    type="text"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    placeholder="Esperando código..."
                                    className="w-full pl-14 pr-4 py-3 text-lg border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                />
                            </div>
                        </form>
                        <ScanResult result={lastScanResult} />
                    </div>
                </div>

                {/* Columna Derecha: Registros y Lista */}
                <div className="flex flex-col min-h-[500px]">
                    <div className="mb-4 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('log')}
                                className={`${activeTab === 'log' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Fichajes de Hoy
                            </button>
                            <button
                                onClick={() => setActiveTab('drivers')}
                                className={`${activeTab === 'drivers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Lista de Choferes
                            </button>
                        </nav>
                    </div>
                    <div className="flex-grow">
                        {loading ? (
                            <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-md">
                                <p className="text-gray-500">Cargando datos de choferes...</p>
                            </div>
                        ) : (
                            <>
                                <div className={activeTab === 'log' ? 'block h-full' : 'hidden'}>
                                    <CheckinLog records={checkinLog} />
                                </div>
                                <div className={activeTab === 'drivers' ? 'block h-full' : 'hidden'}>
                                    <DriverList drivers={allDrivers} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
