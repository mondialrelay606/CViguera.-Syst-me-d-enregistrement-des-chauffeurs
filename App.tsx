import React, { useState, useEffect, useRef } from 'react';
import { Driver, CheckinRecord, ScanStatus, type ScanResult as ScanResultType, CheckinType } from './types';
import { driverService } from './services/driverService';
import Clock from './components/Clock';
import ScanResult from './components/ScanResult';
import CheckinLog from './components/CheckinLog';
import AdminLoginModal from './components/admin/AdminLoginModal';
import AdminDashboard from './components/admin/AdminDashboard';
import DriverList from './components/DriverList';

// --- Constantes de la aplicación ---
const ADMIN_PASSWORD = 'admin'; // En una app real, esto debería ser seguro.
const CHECKIN_LOG_STORAGE_KEY = 'checkinLog';

/**
 * Comprueba si una fecha dada corresponde al día de hoy.
 */
const isToday = (someDate: Date): boolean => {
  const today = new Date();
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear();
};


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
        try {
            const savedLog = localStorage.getItem(CHECKIN_LOG_STORAGE_KEY);
            // Aseguramos que los datos antiguos se lean correctamente
            return savedLog ? JSON.parse(savedLog).map((r: any) => ({
                ...r, 
                type: r.type || CheckinType.DEPARTURE, 
                timestamp: new Date(r.timestamp),
                hasUniform: r.hasUniform
            })) : [];
        } catch (error) {
            console.error("Error al cargar el registro de fichajes:", error);
            return [];
        }
    });
    const [barcode, setBarcode] = useState('');
    const [lastScanResult, setLastScanResult] = useState<ScanResultType>({ status: ScanStatus.IDLE, message: '' });
    const [loading, setLoading] = useState(true);
    const [checkinType, setCheckinType] = useState<CheckinType>(CheckinType.DEPARTURE);
    const [hasUniform, setHasUniform] = useState(true); // Nuevo estado para el uniforme
    
    const [isAdminView, setIsAdminView] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    
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
        barcodeInputRef.current?.focus();
    }, []);

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
            const driverCheckinsToday = checkinLog
                .filter(record => record.driver.id === foundDriver.id && isToday(record.timestamp))
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            
            const lastCheckinType = driverCheckinsToday.length > 0 ? driverCheckinsToday[0].type : null;

            if (checkinType === CheckinType.DEPARTURE && lastCheckinType === CheckinType.DEPARTURE) {
                setLastScanResult({
                    status: ScanStatus.ERROR,
                    message: `Error: ${foundDriver.name} ya tiene una salida registrada sin retorno. No puede fichar 'Départ' de nuevo.`
                });
                setBarcode('');
                return;
            }

            if (checkinType === CheckinType.RETURN && lastCheckinType !== CheckinType.DEPARTURE) {
                setLastScanResult({
                    status: ScanStatus.ERROR,
                    message: `Error: ${foundDriver.name} no puede fichar 'Retour' sin un 'Départ' previo hoy.`
                });
                setBarcode('');
                return;
            }

            const newRecord: CheckinRecord = {
                driver: foundDriver,
                timestamp: new Date(),
                type: checkinType,
            };
            
            let successMessage = `[${checkinType}] ${foundDriver.name} fichado correctamente.`;
            if (checkinType === CheckinType.DEPARTURE) {
                newRecord.hasUniform = hasUniform;
                successMessage = `[${checkinType}] ${foundDriver.name} fichado (Uniforme: ${hasUniform ? 'Sí' : 'No'}).`;
            }

            setCheckinLog(prevLog => [newRecord, ...prevLog]);
            setLastScanResult({ status: ScanStatus.SUCCESS, message: successMessage });
        
        } else {
            setLastScanResult({ status: ScanStatus.ERROR, message: `Código de barras "${barcode}" no encontrado. Verifique al chofer.` });
        }
        setBarcode('');
        setHasUniform(true); // Resetear el checkbox a su estado por defecto para el siguiente fichaje
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

    const handleUpdateDrivers = async (newDrivers: Driver[]) => {
        try {
            await driverService.updateDrivers(newDrivers);
            setAllDrivers(newDrivers);
            alert('La lista de choferes ha sido actualizada correctamente.');
        } catch (error) {
            alert('Error al actualizar la lista de choferes.');
            console.error(error);
        }
    };

    const handleUpdateSingleDriver = async (updatedDriver: Driver) => {
        try {
            await driverService.updateSingleDriver(updatedDriver);
            setAllDrivers(prevDrivers => 
                prevDrivers.map(d => d.id === updatedDriver.id ? updatedDriver : d)
            );
        } catch (error) {
            alert('Error al actualizar el chofer.');
            console.error(error);
        }
    };

    const handleDeleteDriver = async (driverId: string) => {
        if (!window.confirm(`¿Está seguro de que desea eliminar al chofer con ID ${driverId}? Esta acción no se puede deshacer.`)) {
            return;
        }
        try {
            await driverService.deleteDriver(driverId);
            setAllDrivers(prevDrivers => prevDrivers.filter(d => d.id !== driverId));
            alert('Chofer eliminado correctamente.');
        } catch (error) {
            alert('Error al eliminar el chofer.');
            console.error(error);
        }
    };

    if (isAdminView) {
        return <AdminDashboard 
            allRecords={checkinLog} 
            allDrivers={allDrivers} 
            onLogout={handleLogout} 
            onUpdateDrivers={handleUpdateDrivers}
            onUpdateSingleDriver={handleUpdateSingleDriver}
            onDeleteDriver={handleDeleteDriver}
        />;
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
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center space-y-6">
                        <Clock />
                        <div className="w-full max-w-md mx-auto">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button
                                    onClick={() => setCheckinType(CheckinType.DEPARTURE)}
                                    className={`py-4 px-4 rounded-lg text-lg font-semibold transition-all duration-200 ${checkinType === CheckinType.DEPARTURE ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {CheckinType.DEPARTURE}
                                </button>
                                <button
                                    onClick={() => setCheckinType(CheckinType.RETURN)}
                                    className={`py-4 px-4 rounded-lg text-lg font-semibold transition-all duration-200 ${checkinType === CheckinType.RETURN ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {CheckinType.RETURN}
                                </button>
                            </div>
                            
                            {/* Checkbox para el uniforme, solo visible en 'Départ' */}
                            {checkinType === CheckinType.DEPARTURE && (
                                <div className="flex items-center justify-center mb-4 p-2 bg-blue-50 rounded-lg">
                                    <input
                                        id="uniform-check"
                                        type="checkbox"
                                        checked={hasUniform}
                                        onChange={(e) => setHasUniform(e.target.checked)}
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="uniform-check" className="ml-3 text-base font-medium text-gray-800">
                                        Lleva el uniforme
                                    </label>
                                </div>
                            )}

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

                    {/* Columna Derecha: Registros */}
                     <div className="flex flex-col min-h-[500px]">
                         {loading ? (
                            <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-md">
                                <p className="text-gray-500">Cargando datos...</p>
                            </div>
                        ) : (
                           <CheckinLog records={checkinLog} />
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default App;
