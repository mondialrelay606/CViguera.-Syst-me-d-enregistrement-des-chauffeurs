import React, { useState, useMemo, useEffect } from 'react';
import { ReturnReport, CheckinRecord, CheckinType, PudoApmFermeReason } from '../../types';

interface ReturnReportFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (report: ReturnReport) => void;
    checkinRecords: CheckinRecord[];
    existingReports: ReturnReport[];
    reportToEdit?: ReturnReport | null;
}

const isToday = (someDate: Date): boolean => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

const initialState = {
    selectedCheckinId: '',
    lettreDeVoiture: { tamponDuRelais: false, horaireDePassageLocker: false },
    saturation: { active: false, lockerName: '', sacs: 0, vracs: 0 },
    manquante: { active: false, pudoApmName: '', sacs: 0, vracs: 0 },
    ferme: { active: false, pudoApmName: '', reason: PudoApmFermeReason.CIERRE_SALVAJE },
    notes: '',
};

const ReturnReportFormModal: React.FC<ReturnReportFormModalProps> = ({ isOpen, onClose, onSave, checkinRecords, existingReports, reportToEdit }) => {
    const [formData, setFormData] = useState(initialState);
    const isEditMode = !!reportToEdit;

    const eligibleCheckins = useMemo(() => {
        const reportedCheckinIds = new Set(existingReports.map(r => r.checkinId));
        return checkinRecords.filter(r => {
            const checkinId = `${r.driver.id}-${r.timestamp.getTime()}`;
            return r.type === CheckinType.RETURN && 
                isToday(r.timestamp) &&
                (!reportedCheckinIds.has(checkinId) || checkinId === reportToEdit?.checkinId);
        });
    }, [checkinRecords, existingReports, reportToEdit]);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && reportToEdit) {
                setFormData({
                    selectedCheckinId: reportToEdit.checkinId,
                    lettreDeVoiture: reportToEdit.lettreDeVoiture,
                    saturation: {
                        active: !!reportToEdit.saturationLocker,
                        lockerName: reportToEdit.saturationLocker?.lockerName || '',
                        sacs: reportToEdit.saturationLocker?.sacs || 0,
                        vracs: reportToEdit.saturationLocker?.vracs || 0,
                    },
                    manquante: {
                        active: !!reportToEdit.livraisonManquante,
                        pudoApmName: reportToEdit.livraisonManquante?.pudoApmName || '',
                        sacs: reportToEdit.livraisonManquante?.sacs || 0,
                        vracs: reportToEdit.livraisonManquante?.vracs || 0,
                    },
                    ferme: {
                        active: !!reportToEdit.pudoApmFerme,
                        pudoApmName: reportToEdit.pudoApmFerme?.pudoApmName || '',
                        reason: reportToEdit.pudoApmFerme?.reason || PudoApmFermeReason.CIERRE_SALVAJE,
                    },
                    notes: reportToEdit.notes || '',
                });
            } else {
                setFormData(initialState);
            }
        }
    }, [isOpen, reportToEdit]);

    const handleChange = (section: keyof typeof initialState, field: string, value: any) => {
        if (section === 'lettreDeVoiture' || section === 'saturation' || section === 'manquante' || section === 'ferme') {
            setFormData(prev => ({
                ...prev,
                [section]: { ...(prev[section] as object), [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedCheckin = checkinRecords.find(c => `${c.driver.id}-${c.timestamp.getTime()}` === formData.selectedCheckinId);

        if (!selectedCheckin) {
            alert("Por favor, seleccione un fichaje de retorno válido.");
            return;
        }

        const reportData: Omit<ReturnReport, 'id'> = {
            checkinId: formData.selectedCheckinId,
            driverId: selectedCheckin.driver.id,
            driverName: selectedCheckin.driver.name,
            subcontractor: selectedCheckin.driver.subcontractor,
            reportDate: isEditMode ? reportToEdit.reportDate : new Date().toISOString(),
            lettreDeVoiture: formData.lettreDeVoiture,
            notes: formData.notes.trim() || undefined,
            saturationLocker: formData.saturation.active ? { lockerName: formData.saturation.lockerName, sacs: formData.saturation.sacs, vracs: formData.saturation.vracs } : undefined,
            livraisonManquante: formData.manquante.active ? { pudoApmName: formData.manquante.pudoApmName, sacs: formData.manquante.sacs, vracs: formData.manquante.vracs } : undefined,
            pudoApmFerme: formData.ferme.active ? { pudoApmName: formData.ferme.pudoApmName, reason: formData.ferme.reason } : undefined,
        };
        
        const finalReport: ReturnReport = {
            id: isEditMode ? reportToEdit.id : `${Date.now()}`,
            ...reportData,
        };
        
        onSave(finalReport);
        onClose();
    };

    if (!isOpen) return null;

    const renderSection = (title: string, isActive: boolean, onToggle: () => void, children: React.ReactNode) => (
        <div className="p-4 border rounded-md mt-4">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700">{title}</h4>
                <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={isActive} onChange={onToggle} />
            </div>
            {isActive && <div className="mt-4 space-y-3">{children}</div>}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start pt-10 pb-10 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? 'Editar Reporte' : 'Crear Reporte de Retorno'}</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fichaje de Retorno del Chofer</label>
                            <select
                                value={formData.selectedCheckinId}
                                onChange={e => setFormData(prev => ({ ...prev, selectedCheckinId: e.target.value }))}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                                required
                                disabled={isEditMode}
                            >
                                <option value="" disabled>-- Seleccione un chofer y su hora de retorno --</option>
                                {eligibleCheckins.map(c => (
                                    <option key={`${c.driver.id}-${c.timestamp.getTime()}`} value={`${c.driver.id}-${c.timestamp.getTime()}`}>
                                        {c.driver.name} ({c.driver.subcontractor}) - Retorno a las {c.timestamp.toLocaleTimeString('es-ES')}
                                    </option>
                                ))}
                            </select>
                            {eligibleCheckins.length === 0 && !isEditMode && <p className="text-xs text-red-600 mt-1">No hay retornos de hoy pendientes de reporte.</p>}
                        </div>

                        <div className="p-4 border rounded-md mt-4">
                           <h4 className="font-semibold text-gray-700 mb-3">Lettre de Voiture</h4>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center"><input type="checkbox" className="h-4 w-4 mr-2" checked={formData.lettreDeVoiture.tamponDuRelais} onChange={e => handleChange('lettreDeVoiture', 'tamponDuRelais', e.target.checked)} /> Tampon du relais</label>
                                <label className="flex items-center"><input type="checkbox" className="h-4 w-4 mr-2" checked={formData.lettreDeVoiture.horaireDePassageLocker} onChange={e => handleChange('lettreDeVoiture', 'horaireDePassageLocker', e.target.checked)} /> Horaire de passage locker</label>
                            </div>
                        </div>
                        
                        {renderSection("Incidencia: Saturation Locker", formData.saturation.active, () => handleChange('saturation', 'active', !formData.saturation.active),
                            <>
                                <input type="text" placeholder="Nombre del Locker" value={formData.saturation.lockerName} onChange={e => handleChange('saturation', 'lockerName', e.target.value)} className="w-full p-2 border rounded-md" required={formData.saturation.active} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="Nº Sacos" value={formData.saturation.sacs} onChange={e => handleChange('saturation', 'sacs', parseInt(e.target.value) || 0)} min="0" className="w-full p-2 border rounded-md" />
                                    <input type="number" placeholder="Nº Vracs" value={formData.saturation.vracs} onChange={e => handleChange('saturation', 'vracs', parseInt(e.target.value) || 0)} min="0" className="w-full p-2 border rounded-md" />
                                </div>
                            </>
                        )}
                        
                        {renderSection("Incidencia: Livraison Manquante", formData.manquante.active, () => handleChange('manquante', 'active', !formData.manquante.active),
                            <>
                                <input type="text" placeholder="Nombre PUDO/APM" value={formData.manquante.pudoApmName} onChange={e => handleChange('manquante', 'pudoApmName', e.target.value)} className="w-full p-2 border rounded-md" required={formData.manquante.active} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="Nº Sacos" value={formData.manquante.sacs} onChange={e => handleChange('manquante', 'sacs', parseInt(e.target.value) || 0)} min="0" className="w-full p-2 border rounded-md" />
                                    <input type="number" placeholder="Nº Vracs" value={formData.manquante.vracs} onChange={e => handleChange('manquante', 'vracs', parseInt(e.target.value) || 0)} min="0" className="w-full p-2 border rounded-md" />
                                </div>
                            </>
                        )}

                        {renderSection("Incidencia: PUDO/APM Fermé", formData.ferme.active, () => handleChange('ferme', 'active', !formData.ferme.active),
                             <>
                                <input type="text" placeholder="Nombre PUDO/APM" value={formData.ferme.pudoApmName} onChange={e => handleChange('ferme', 'pudoApmName', e.target.value)} className="w-full p-2 border rounded-md" required={formData.ferme.active} />
                                <select value={formData.ferme.reason} onChange={e => handleChange('ferme', 'reason', e.target.value as PudoApmFermeReason)} className="w-full p-2 border rounded-md mt-2">
                                    <option value={PudoApmFermeReason.CIERRE_SALVAJE}>Cierre salvaje</option>
                                    <option value={PudoApmFermeReason.PANNE}>Panne</option>
                                </select>
                             </>
                        )}

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Notas Adicionales</label>
                            <textarea value={formData.notes} onChange={e => setFormData(prev => ({...prev, notes: e.target.value}))} rows={3} className="w-full p-2 border rounded-md mt-1"></textarea>
                        </div>
                    </div>
                    <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3">
                         <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
                         <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" disabled={!formData.selectedCheckinId}>
                            {isEditMode ? 'Guardar Cambios' : 'Guardar Reporte'}
                         </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReturnReportFormModal;
