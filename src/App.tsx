import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Driver, AttendanceRecord, ScanResult, ScanStatus, ReturnInfo, SubcontractorUser } from './types';
import { driverService } from './services/driverService';
import { notificationService } from './services/notificationService';
import { useTranslation } from './contexts/LanguageContext';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import DriverDashboard from './components/DriverDashboard';
import Clock from './components/Clock';
import ScanResultDisplay from './components/ScanResult';
import SubcontractorLogin from './components/SubcontractorLogin';
import SubcontractorPanel from './components/SubcontractorPanel';

type View = 'login' | 'driverDashboard' | 'adminPanel' | 'subcontractorPanel';

// --- Custom Hook for Debounced Effect ---
const useDebouncedEffect = (callback: () => void, delay: number, deps: React.DependencyList) => {
    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        const handler = setTimeout(callback, delay);
        return () => clearTimeout(handler);
    }, [...deps, delay]);
};


const App: React.FC = () => {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [subcontractorUsers, setSubcontractorUsers] = useState<SubcontractorUser[]>([]);
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const savedRecords = localStorage.getItem('attendanceRecords');
      return savedRecords ? JSON.parse(savedRecords, (key, value) => {
        if (key === 'checkinTime' || key === 'checkoutTime') {
          return value ? new Date(value) : null;
        }
        return value;
      }) : [];
    } catch (error) {
      console.error("Error loading attendance records from localStorage", error);
      return [];
    }
  });

  const [returnRecords, setReturnRecords] = useState<ReturnInfo[]>(() => {
      try {
          const savedRecords = localStorage.getItem('returnRecords');
          return savedRecords ? JSON.parse(savedRecords, (key, value) => {
              if (key === 'recordedAt') {
                  return new Date(value);
              }
              return value;
          }) : [];
      } catch (error) {
          console.error("Error loading return records from localStorage", error);
          return [];
      }
  });
  
  const [view, setView] = useState<View>('login');
  const [activeDriver, setActiveDriver] = useState<Driver | null>(null);
  const [activeSubcontractor, setActiveSubcontractor] = useState<SubcontractorUser | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult>({ status: ScanStatus.IDLE, message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubcontractorLoginOpen, setIsSubcontractorLoginOpen] = useState(false);

  useEffect(() => {
    Promise.all([
        driverService.fetchDrivers(),
        driverService.fetchSubcontractorUsers()
    ]).then(([fetchedDrivers, fetchedSubcontractorUsers]) => {
        setDrivers(fetchedDrivers);
        setSubcontractorUsers(fetchedSubcontractorUsers);
    }).catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // --- Debounced localStorage saving ---
  useDebouncedEffect(() => {
    try {
      localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    } catch (error) {
      console.error("Error saving attendance records to localStorage", error);
    }
  }, 500, [attendanceRecords]);

  useDebouncedEffect(() => {
      try {
          localStorage.setItem('returnRecords', JSON.stringify(returnRecords));
      } catch (error) {
          console.error("Error saving return records to localStorage", error);
      }
  }, 500, [returnRecords]);
  
  useDebouncedEffect(() => {
    if (!isLoading) { // Don't save initial empty array while loading
      try {
        localStorage.setItem('drivers', JSON.stringify(drivers));
      } catch (error) {
        console.error("Error saving drivers to localStorage", error);
      }
    }
  }, 500, [drivers, isLoading]);

  const resetScanResult = useCallback(() => {
    setTimeout(() => setScanResult({ status: ScanStatus.IDLE, message: '' }), 5000);
  }, []);
  
  const handleCheckIn = useCallback((driver: Driver, plate: string) => {
    const newRecord: AttendanceRecord = {
      id: `${Date.now()}-${driver.id}`,
      driver,
      checkinTime: new Date(),
      checkoutTime: null,
      vehiclePlate: plate,
      returnInfoCompleted: false,
      uniformVerified: false,
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);
    notificationService.sendNotification(`Check-in: ${driver.name} con matrícula ${plate}.`);
    
    setScanResult({
        status: ScanStatus.SUCCESS,
        message: t('scanResult.checkinSuccess', { name: driver.name }),
    });
    resetScanResult();
  }, [t, resetScanResult]);

  const handleCheckOut = useCallback((driver: Driver) => {
    const now = new Date();
    setAttendanceRecords(prev => 
      prev.map(rec => 
        rec.driver.id === driver.id && rec.checkoutTime === null 
          ? { ...rec, checkoutTime: now } 
          : rec
      )
    );
    notificationService.sendNotification(`Check-out: ${driver.name}.`);
    setScanResult({
        status: ScanStatus.SUCCESS,
        message: t('scanResult.checkoutSuccess', { name: driver.name }),
    });
    resetScanResult();
  }, [t, resetScanResult]);

  const handleDriverIdentification = useCallback((id: string): { driver: Driver | null, isCheckedIn: boolean, error?: string } => {
    const driver = drivers.find(d => d.id === id);
    if (!driver) {
      return { driver: null, isCheckedIn: false, error: t('login.errorNotFound', { id }) };
    }
    
    const activeRecord = attendanceRecords.find(r => r.driver.id === id && r.checkoutTime === null);
    return { driver, isCheckedIn: !!activeRecord, error: undefined };
  }, [drivers, attendanceRecords, t]);
  
  const handleProfileAccess = useCallback((driver: Driver) => {
    setActiveDriver(driver);
    setView('driverDashboard');
  }, []);

  const handleAdminAccess = useCallback(() => {
    setView('adminPanel');
  }, []);

  const handleLogout = useCallback(() => {
    setActiveDriver(null);
    setActiveSubcontractor(null);
    setView('login');
  }, []);

  const handleSubcontractorLogin = useCallback((username: string, password: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          const user = subcontractorUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
          if (user && user.password === password) {
              setActiveSubcontractor(user);
              setView('subcontractorPanel');
              setIsSubcontractorLoginOpen(false);
              resolve();
          } else {
              reject(new Error(t('login.subcontractor.error')));
          }
      });
  }, [subcontractorUsers, t]);

  const handleUpdatePlate = useCallback((driverId: string, newPlate: string) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, vehiclePlate: newPlate } : d));
    setAttendanceRecords(prev => prev.map(rec => 
      rec.driver.id === driverId && rec.checkoutTime === null 
        ? { ...rec, vehiclePlate: newPlate } 
        : rec
    ));
  }, []);
  
  const handleFileImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        
        const newDrivers: Driver[] = lines.map((line, index) => {
          const parts = line.split(',').map(part => part.trim());
           if (parts.length < 3 || parts.length > 6) {
            throw new Error(`Error en la línea ${index + 1}: Se esperan entre 3 y 6 columnas.`);
          }
          const [id, name, company, subcontractor = '', vehiclePlate = '', route = ''] = parts;
          if (!id || !name || !company) {
             throw new Error(`Error en la línea ${index + 1}: ID, Nombre y Empresa son obligatorios.`);
          }
          return { id, name, company, subcontractor, vehiclePlate, route };
        });

        setDrivers(newDrivers);
        setScanResult({ status: ScanStatus.SUCCESS, message: t('adminPanel.importSuccess') });
      } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : t('adminPanel.importErrorFormat');
        setScanResult({ status: ScanStatus.ERROR, message: errorMessage });
      } finally {
        resetScanResult();
      }
    };
    reader.onerror = () => {
        setScanResult({ status: ScanStatus.ERROR, message: t('adminPanel.importError') });
        resetScanResult();
    };
    reader.readAsText(file);
  }, [t, resetScanResult]);

  const handleUpdateDriverRoute = useCallback((driverId: string, newRoute: string) => {
    let driverName = '';
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        driverName = d.name;
        return { ...d, route: newRoute };
      }
      return d;
    }));
    setScanResult({
        status: ScanStatus.SUCCESS,
        message: t('adminPanel.routeUpdateSuccess', { name: driverName })
    });
    resetScanResult();
  }, [t, resetScanResult]);

  const handleSaveReturnInfo = useCallback((info: Omit<ReturnInfo, 'recordedAt'>) => {
    setReturnRecords(prev => [...prev, { ...info, recordedAt: new Date() }]);
    setAttendanceRecords(prev => prev.map(rec => 
      rec.id === info.attendanceRecordId 
        ? { ...rec, returnInfoCompleted: true } 
        : rec
    ));
     setScanResult({
        status: ScanStatus.SUCCESS,
        message: t('adminPanel.retourTournee.saveSuccess')
    });
    resetScanResult();
  }, [t, resetScanResult]);

  const handleSaveDepartureNotes = useCallback((attendanceRecordId: string, notes: string) => {
    setAttendanceRecords(prev => prev.map(rec =>
      rec.id === attendanceRecordId
        ? { ...rec, departureNotes: notes }
        : rec
    ));
    setScanResult({
      status: ScanStatus.SUCCESS,
      message: t('adminPanel.departChauffeur.saveSuccess')
    });
    resetScanResult();
  }, [t, resetScanResult]);

  const handleVerifyUniform = useCallback((attendanceRecordId: string) => {
    let driverName = '';
    setAttendanceRecords(prev => prev.map(rec => {
        if (rec.id === attendanceRecordId) {
            driverName = rec.driver.name;
            return { ...rec, uniformVerified: true };
        }
        return rec;
    }));
    setScanResult({
        status: ScanStatus.SUCCESS,
        message: t('adminPanel.departChauffeur.verifySuccess', { name: driverName })
    });
    resetScanResult();
  }, [t, resetScanResult]);

  const handleAddSubcontractorUser = useCallback((user: SubcontractorUser) => {
      if (subcontractorUsers.some(u => u.username.toLowerCase() === user.username.toLowerCase())) {
          setScanResult({ status: ScanStatus.ERROR, message: t('adminPanel.subcontractors.errorUserExists') });
      } else {
          setSubcontractorUsers(prev => [...prev, user]);
          setScanResult({ status: ScanStatus.SUCCESS, message: t('adminPanel.subcontractors.userAdded') });
      }
      resetScanResult();
  }, [subcontractorUsers, t, resetScanResult]);

  const handleUpdateSubcontractorPassword = useCallback((username: string, newPassword: string) => {
      setSubcontractorUsers(prev => prev.map(u => u.username === username ? { ...u, password: newPassword } : u));
      setScanResult({ status: ScanStatus.SUCCESS, message: t('adminPanel.subcontractors.passwordUpdated') });
      resetScanResult();
  }, [t, resetScanResult]);

  // Memoize data for subcontractor panel to avoid re-calculations on every render
  const subcontractorDrivers = useMemo(() => {
      if (!activeSubcontractor) return [];
      return drivers.filter(d => d.subcontractor === activeSubcontractor.companyName);
  }, [activeSubcontractor, drivers]);

  const subcontractorRecords = useMemo(() => {
      if (!activeSubcontractor) return [];
      const filteredDriverIds = new Set(subcontractorDrivers.map(d => d.id));
      return attendanceRecords.filter(r => filteredDriverIds.has(r.driver.id));
  }, [activeSubcontractor, attendanceRecords, subcontractorDrivers]);


  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center bg-slate-100"><p>{t('general.loading')}</p></div>;
  }

  const renderView = () => {
    switch(view) {
      case 'login':
        return (
          <div className="min-h-screen flex flex-col justify-center items-center p-4 login-background">
            <div className="absolute top-8 text-center text-white">
              <Clock />
            </div>
            <div className="w-full max-w-md">
              <Login 
                onIdentifyDriver={handleDriverIdentification} 
                onAdminAccess={handleAdminAccess}
                onProfileAccess={handleProfileAccess}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onSubcontractorAccessRequest={() => setIsSubcontractorLoginOpen(true)}
              />
              <ScanResultDisplay result={scanResult} />
            </div>
             <SubcontractorLogin
                isOpen={isSubcontractorLoginOpen}
                onClose={() => setIsSubcontractorLoginOpen(false)}
                onLogin={handleSubcontractorLogin}
             />
          </div>
        );
      case 'adminPanel':
        return (
          <div className="min-h-screen bg-slate-100">
             <AdminPanel 
               drivers={drivers} 
               records={attendanceRecords} 
               returnRecords={returnRecords}
               subcontractorUsers={subcontractorUsers}
               onLogout={handleLogout} 
               onFileImport={handleFileImport}
               onUpdateDriverRoute={handleUpdateDriverRoute}
               onSaveReturnInfo={handleSaveReturnInfo}
               onSaveDepartureNotes={handleSaveDepartureNotes}
               onVerifyUniform={handleVerifyUniform}
               onAddSubcontractorUser={handleAddSubcontractorUser}
               onUpdateSubcontractorPassword={handleUpdateSubcontractorPassword}
              />
          </div>
        );
      case 'subcontractorPanel':
        if (!activeSubcontractor) {
            setView('login');
            return null;
        }
        return (
           <div className="min-h-screen bg-slate-100">
                <SubcontractorPanel
                    subcontractor={activeSubcontractor}
                    drivers={subcontractorDrivers}
                    records={subcontractorRecords}
                    onLogout={handleLogout}
                />
           </div>
        );
      case 'driverDashboard':
        if (!activeDriver) {
            setView('login');
            return null;
        }
        return (
            <div className="min-h-screen login-background">
                <DriverDashboard 
                    driver={activeDriver} 
                    records={attendanceRecords}
                    onUpdatePlate={handleUpdatePlate}
                    onLogout={handleLogout}
                />
            </div>
        );
    }
  }

  return <>{renderView()}</>;
};

export default App;