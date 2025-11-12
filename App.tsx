import React, { useState, useEffect, useRef } from 'react';
import { Driver, CheckinRecord, ScanStatus, type ScanResult as ScanResultType } from './types';
import { driverService } from './services/driverService';
import Clock from './components/Clock';
import ScanResult from './components/ScanResult';
import CheckinLog from './components/CheckinLog';
import DriverList from './components/DriverList';
import AdminLoginModal from './components/admin/AdminLoginModal';
import AdminDashboard from './components/admin/AdminDashboard';

// --- Constantes de la aplicación ---
const ADMIN_PASSWORD = 'admin'; // En una app real, esto debería ser seguro.
const CHECKIN_LOG_STORAGE_KEY = 'checkinLog';

const BarcodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 0 1 4.5 3.75h15a.75.75 0 0 1 .75.75v15a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75v-15Zm.75 0v15h13.5v-15h-13.5ZM8.25 6h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Zm2.25 0h.75v12h-.75V6Z" />
    </svg>
);

const AdminIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
    </svg>
);


const App: React.FC = () => {
    const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
    const [checkinLog, setCheckinLog] = useState<CheckinRecord[]>(() => {
        // Cargar desde localStorage al iniciar
        try {
            const savedLog = localStorage.getItem(CHECKIN_LOG_STORAGE_KEY);
            return savedLog ? JSON.parse(savedLog).map((r: any) => ({...r, timestamp: new Date(r.timestamp)})) : [];
        } catch (error) {
            console.error("Error al cargar el registro de fichajes:", error);
            return [];
        }
    });
    const [barcode, setBarcode] = useState('');
    const [lastScanResult, setLastScanResult] = useState<ScanResultType>({ status: ScanStatus.IDLE, message: '' });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'log' | 'drivers'>('log');
    
    // --- Estado de Administración ---
    const [isAdminView, setIsAdminView] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    // Cargar choferes al montar el componente
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
        barcodeInputRef.current?.focus();
    }, []);

    // Guardar en localStorage cuando el registro cambie
    useEffect(() => {
        try {
            localStorage.setItem(CHECKIN_LOG_STORAGE_KEY, JSON.stringify(checkinLog));
        } catch (error) {
            console.error("Error al guardar el registro de fichajes:", error);
        }
    }, [checkinLog]);

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

    const handleAdminLogin = (password: string) => {
        if (password === ADMIN_PASSWORD) {
            setIsAdminView(true);
            setShowAdminLogin(false);
        } else {
            alert('Contraseña incorrecta.');
        }
    };
    
    const handleLogout = () => {
        setIsAdminView(false);
        barcodeInputRef.current?.focus();
    };

    if (isAdminView) {
        return <AdminDashboard allRecords={checkinLog} onLogout={handleLogout} />;
    }

    return (
        <>
            <AdminLoginModal
                isOpen={showAdminLogin}
                onClose={() => setShowAdminLogin(false)}
                onLogin={handleAdminLogin}
            />
            <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col">
                <header className="mb-6">
                    <div className="relative text-center">
                        <h1 className="text-4xl font-bold text-gray-800">Sistema de Fichaje de Choferes</h1>
                        <p className="text-lg text-gray-600">Registro de entradas por código de barras</p>
                        <button
                            onClick={() => setShowAdminLogin(true)}
                            className="absolute top-0 right-0 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all"
                            aria-label="Acceso de administrador"
                        >
                            <AdminIcon />
                            <span>Administración</span>
                        </button>
                    </div>
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
        </>
    );
};

export default App;