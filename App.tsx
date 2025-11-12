import React, { useState, useEffect } from 'react';
import { Driver, AttendanceRecord, ScanStatus, type ScanResult as ScanResultType } from './types';
import { driverService } from './services/driverService';
import { notificationService } from './services/notificationService';
import { useTranslation } from './contexts/LanguageContext';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import DriverDashboard from './components/DriverDashboard';
import VehiclePlateEntry from './components/VehiclePlateEntry';

type View = 'login' | 'driver' | 'admin' | 'plateEntry';

const App: React.FC = () => {
    const { t } = useTranslation();
    const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
    const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([]);
    const [activeDriverIds, setActiveDriverIds] = useState<Set<string>>(new Set());
    const [lastScanResult, setLastScanResult] = useState<ScanResultType>({ status: ScanStatus.IDLE, message: '' });
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [view, setView] = useState<View>('login');
    const [currentUser, setCurrentUser] = useState<Driver | null>(null);

    useEffect(() => {
        const loadDrivers = async () => {
            try {
                const drivers = await driverService.fetchDrivers();
                setAllDrivers(drivers);
            } catch (error) {
                console.error("Error al cargar los choferes:", error);
                setLastScanResult({ status: ScanStatus.ERROR, message: t('app.errors.loadDrivers') });
            } finally {
                setLoading(false);
            }
        };
        loadDrivers();
    }, [t]);

    const handleScan = (barcode: string) => {
        const trimmedBarcode = barcode.trim();
        if (!trimmedBarcode) return;

        const foundDriver = allDrivers.find(driver => driver.id === trimmedBarcode);

        if (!foundDriver) {
            setLastScanResult({ status: ScanStatus.ERROR, message: t('app.scan.notFound', { barcode: trimmedBarcode }) });
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
            const message = t('app.scan.checkoutSuccess', { name: foundDriver.name });
            setLastScanResult({ status: ScanStatus.INFO, message });
            notificationService.sendNotification(`${t('app.notifications.checkout')}: ${foundDriver.name} (${foundDriver.company}) at ${now.toLocaleTimeString()}`);
        } else {
            // Es una entrada (desde el panel de admin, sin matrícula)
            const newRecord: AttendanceRecord = {
                driver: foundDriver,
                checkinTime: now,
                checkoutTime: null,
            };
            setAttendanceLog(prevLog => [newRecord, ...prevLog]);
            setActiveDriverIds(prevIds => new Set(prevIds).add(foundDriver.id));
            const message = t('app.scan.checkinSuccess', { name: foundDriver.name });
            setLastScanResult({ status: ScanStatus.SUCCESS, message });
            notificationService.sendNotification(`${t('app.notifications.checkin')}: ${foundDriver.name} (${foundDriver.company}) at ${now.toLocaleTimeString()}`);
        }
    };
    
    const handleDriverLogin = (id: string): boolean => {
        const foundDriver = allDrivers.find(driver => driver.id === id);
        if (!foundDriver) return false;
        
        setCurrentUser(foundDriver);
        setView('plateEntry');
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
        console.log(`Matrícula actualizada para ${driverId}: ${newPlate}`);
    };

    const handleLoginAndCheckIn = (plate: string) => {
        if (!currentUser) return;

        handleUpdatePlate(currentUser.id, plate);

        const now = new Date();
        if (activeDriverIds.has(currentUser.id)) {
            console.warn("El chofer ya tiene una sesión activa. Omitiendo nueva entrada.");
            setView('driver');
            return;
        }

        const newRecord: AttendanceRecord = {
            driver: currentUser,
            checkinTime: now,
            checkoutTime: null,
            vehiclePlate: plate,
        };
        setAttendanceLog(prevLog => [newRecord, ...prevLog]);
        setActiveDriverIds(prevIds => new Set(prevIds).add(currentUser.id));

        notificationService.sendNotification(`${t('app.notifications.checkin')}: ${currentUser.name} (${currentUser.company}) with plate ${plate} at ${now.toLocaleTimeString()}`);
        
        setView('driver');
    };

    const handleSyncDrivers = async () => {
        setIsSyncing(true);
        setLastScanResult({ status: ScanStatus.INFO, message: t('app.sync.syncing') });
        try {
            const updatedDrivers = await driverService.scrapeDrivers();
            setAllDrivers(updatedDrivers);
            setLastScanResult({ status: ScanStatus.SUCCESS, message: t('app.sync.success', { count: updatedDrivers.length }) });
        } catch (error) {
            console.error("Error al sincronizar los choferes:", error);
            setLastScanResult({ status: ScanStatus.ERROR, message: t('app.sync.error') });
        } finally {
            setIsSyncing(false);
        }
    };

    if (loading && view === 'login') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="bg-black/50 p-6 rounded-lg shadow-xl">
                    <p className="text-white text-lg animate-pulse">{t('general.loadingApp')}</p>
                </div>
            </div>
        );
    }
    
    switch (view) {
        case 'plateEntry':
            return currentUser ? (
                <VehiclePlateEntry 
                    driver={currentUser}
                    onPlateSubmit={handleLoginAndCheckIn}
                />
            ) : null;
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
                    onSyncDrivers={handleSyncDrivers}
                    isSyncing={isSyncing}
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