import React, { useState, useEffect } from 'react';
import { Driver, AttendanceRecord, ScanStatus, type ScanResult as ScanResultType } from './types';
import { driverService } from './services/driverService';
import { notificationService } from './services/notificationService';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import DriverDashboard from './components/DriverDashboard';

type View = 'login' | 'driver' | 'admin';

const App: React.FC = () => {
    const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
    const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([]);
    const [activeDriverIds, setActiveDriverIds] = useState<Set<string>>(new Set());
    const [lastScanResult, setLastScanResult] = useState<ScanResultType>({ status: ScanStatus.IDLE, message: '' });
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<View>('login');
    const [currentUser, setCurrentUser] = useState<Driver | null>(null);

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
    }, []);

    const handleScan = (barcode: string) => {
        const trimmedBarcode = barcode.trim();
        if (!trimmedBarcode) return;

        const foundDriver = allDrivers.find(driver => driver.id === trimmedBarcode);

        if (!foundDriver) {
            setLastScanResult({ status: ScanStatus.ERROR, message: `Código de barras "${trimmedBarcode}" no encontrado.` });
            return;
        }

        const now = new Date();
        const isDriverActive = activeDriverIds.has(foundDriver.id);

        if (isDriverActive) {
            // Es una salida
            setAttendanceLog(prevLog =>
                prevLog.map(record =>
                    record.driver.id === foundDriver.id && record.checkoutTime === null
                        ? { ...record, checkoutTime: now }
                        : record
                )
            );
            setActiveDriverIds(prevIds => {
                const newIds = new Set(prevIds);
                newIds.delete(foundDriver.id);
                return newIds;
            });
            const message = `Salida registrada para ${foundDriver.name}. ¡Hasta luego!`;
            setLastScanResult({ status: ScanStatus.INFO, message });
            notificationService.sendNotification(`SALIDA: ${foundDriver.name} (${foundDriver.company}) a las ${now.toLocaleTimeString()}`);
        } else {
            // Es una entrada
            const newRecord: AttendanceRecord = {
                driver: foundDriver,
                checkinTime: now,
                checkoutTime: null,
            };
            setAttendanceLog(prevLog => [newRecord, ...prevLog]);
            setActiveDriverIds(prevIds => new Set(prevIds).add(foundDriver.id));
            const message = `Entrada registrada para ${foundDriver.name}. ¡Bienvenido!`;
            setLastScanResult({ status: ScanStatus.SUCCESS, message });
            notificationService.sendNotification(`ENTRADA: ${foundDriver.name} (${foundDriver.company}) a las ${now.toLocaleTimeString()}`);
        }
    };
    
    const handleDriverLogin = (id: string, password?: string): boolean => {
        const foundDriver = allDrivers.find(driver => driver.id === id);
        if (!foundDriver) return false;

        // Si se proporciona contraseña, se valida. Si no, se asume inicio de sesión por escaneo.
        if (password !== undefined && foundDriver.password !== password) {
            return false;
        }
        
        setCurrentUser(foundDriver);
        setView('driver');
        return true;
    };

    const handleAdminAccess = () => {
        setView('admin');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setView('login');
    };

    const handleUpdatePlate = (driverId: string, newPlate: string) => {
        setAllDrivers(prevDrivers =>
            prevDrivers.map(driver =>
                driver.id === driverId ? { ...driver, vehiclePlate: newPlate } : driver
            )
        );
        // En una app real, aquí se haría una llamada a la API para guardar el cambio.
        console.log(`Matrícula actualizada para ${driverId}: ${newPlate}`);
    };

    if (loading && view === 'login') {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-gray-500 text-lg">Cargando aplicación...</p>
            </div>
        );
    }
    
    switch (view) {
        case 'driver':
            return currentUser ? (
                <DriverDashboard 
                    driver={currentUser}
                    records={attendanceLog}
                    onUpdatePlate={handleUpdatePlate}
                    onLogout={handleLogout}
                />
            ) : null;
        case 'admin':
            return (
                <AdminPanel 
                    allDrivers={allDrivers}
                    attendanceLog={attendanceLog}
                    onScan={handleScan}
                    lastScanResult={lastScanResult}
                    loading={loading}
                />
            );
        case 'login':
        default:
            return (
                <Login 
                    onDriverLogin={handleDriverLogin}
                    onAdminAccess={handleAdminAccess}
                />
            );
    }
};

export default App;
