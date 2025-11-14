import React, { useState, useEffect } from 'react';
import { ReturnReport, CheckinRecord, CheckinType, PudoApmFermeReason } from '../../types';

interface ReturnReportFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (report: ReturnReport) => void;
    reportToEdit?: ReturnReport | null;
    checkinForNewReport?: CheckinRecord | null;
    departureComment?: string;
}

const initialState = {
    selectedCheckinId: '',
    lettreDeVoiture: { tamponDuRelais: false, horaireDePassageLocker: false },
    saturationLockers: [],
    livraisonsManquantes: [],
    pudosApmFermes: [],
    notes: '',
};

type FormState = {
    selectedCheckinId: string;
    lettreDeVoiture: { tamponDuRelais: boolean; horaireDePassageLocker: boolean };
    saturationLockers: ({ id: string; } & NonNullable<ReturnReport['saturationLockers']>[0])[];
    livraisonsManquantes: ({ id: string; } & NonNullable<ReturnReport['livraisonsManquantes']>[0])[];
    pudosApmFermes: ({ id: string; } & NonNullable<ReturnReport['pudosApmFermes']>[0])[];
    notes: string;
}


const ReturnReportFormModal: React.FC<ReturnReportFormModalProps> = ({ isOpen, onClose, onSave, reportToEdit, checkinForNewReport, departureComment }) => {
    const [formData, setFormData] = useState<FormState>(initialState);
    const [displayCheckin, setDisplayCheckin] = useState<CheckinRecord | null>(null);
    
    const isEditMode = !!reportToEdit;
    const isCreateModeWithCheckin = !!checkinForNewReport;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && reportToEdit) {
                 setFormData({
                    selectedCheckinId: reportToEdit.checkinId,
                    lettreDeVoiture: reportToEdit.lettreDeVoiture,
                    saturationLockers: reportToEdit.saturationLockers?.map((item, index) => ({ ...item, id: `sat-${index}-${Date.now()}` })) || [],
                    livraisonsManquantes: reportToEdit.livraisonsManquantes?.map((item, index) => ({ ...item, id: `man-${index}-${Date.now()}` })) || [],
                    pudosApmFermes: reportToEdit.pudosApmFermes?.map((item, index) => ({ ...item, id: `fer-${index}-${Date.now()}` })) || [],
                    notes: reportToEdit.notes || '',
                });
                // Find and set the displayCheckin for edit mode from report data
                // This part is for display only, so it might need access to `allRecords` or just display what's in the report
                setDisplayCheckin({ 
                    driver: { 
                        id: reportToEdit.driverId, 
                        name: reportToEdit.driverName, 
                        subcontractor: reportToEdit.subcontractor,
                        plate: '',
                        tour: '',
                        telephone: ''
                    },
                    timestamp: new Date(reportToEdit.reportDate),
                    type: CheckinType.RETURN
                });
            } else if (isCreateModeWithCheckin && checkinForNewReport) {
                setFormData({
                    ...initialState,
                    selectedCheckinId: `${checkinForNewReport.driver.id}-${checkinForNewReport.timestamp.getTime()}`,
                });
                setDisplayCheckin(checkinForNewReport);
            } else {
                setFormData(initialState);
                setDisplayCheckin(null);
            }
        }
    }, [isOpen, reportToEdit, checkinForNewReport]);
    
    const handleListChange = <T extends keyof FormState>(listName: T, id: string, field: string, value: any) => {
        setFormData(prev => {
            const list = prev[listName] as any[];
            return {
                ...prev,
                [listName]: list.map(item => item.id === id ? { ...item, [field]: value } : item)
            };
        });
    };
    
    const addToList = <T extends keyof FormState>(listName: T, newItem: any) => {
         setFormData(prev => {
            const list = prev[listName] as any[];
            return {
                ...prev,
                [listName]: [...list, { ...newItem, id: `${listName}-${Date.now()}` }]
            }
        });
    };
    
    const removeFromList = <T extends keyof FormState>(listName: T, id: string) => {
        setFormData(prev => {
            const list = prev[listName] as any[];
            return {
                ...prev,
                [listName]: list.filter(item => item.id !== id)
            }
        });
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const driverInfoProvider = isCreateModeWithCheckin ? checkinForNewReport : displayCheckin;

        if (!formData.selectedCheckinId || !driverInfoProvider) {
            alert("Aucun pointage de retour valide n'est associé à ce rapport.");
            return;
        }

        const reportData: Omit<ReturnReport, 'id'> = {
            checkinId: formData.selectedCheckinId,
            driverId: driverInfoProvider.driver.id,
            driverName: driverInfoProvider.driver.name,
            subcontractor: driverInfoProvider.driver.subcontractor,
            reportDate: isEditMode && reportToEdit ? reportToEdit.reportDate : new Date().toISOString(),
            lettreDeVoiture: formData.lettreDeVoiture,
            notes: formData.notes.trim() || undefined,
            saturationLockers: formData.saturationLockers.filter(i => i.lockerName.trim()).map(({ id, ...rest }) => rest),
            livraisonsManquantes: formData.livraisonsManquantes.filter(i => i.pudoApmName.trim()).map(({ id, ...rest }) => rest),
            pudosApmFermes: formData.pudosApmFermes.filter(i => i.pudoApmName.trim()).map(({ id, ...rest }) => rest),
        };
        
        const finalReport: ReturnReport = {
            id: isEditMode && reportToEdit ? reportToEdit.id : `${Date.now()}`,
            ...reportData,
        };
        
        onSave(finalReport);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start pt-10 pb-10 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? 'Modifier le Rapport' : 'Créer un Rapport de Retour'}</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pointage de Retour du Chauffeur</label>
                            <div className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 bg-gray-100 text-gray-700 sm:text-sm rounded-md">
                                {displayCheckin ? 
                                    `${displayCheckin.driver.name} (${displayCheckin.driver.subcontractor}) - Retour à ${displayCheckin.timestamp.toLocaleTimeString('fr-FR')}`
                                    : 'Non sélectionné'
                                }
                            </div>
                        </div>

                        {isCreateModeWithCheckin && departureComment && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <h4 className="text-sm font-bold text-yellow-800">Commentaire de Départ :</h4>
                                <p className="mt-1 text-sm text-yellow-900 whitespace-pre-wrap">{departureComment}</p>
                            </div>
                        )}

                        <div className="p-4 border rounded-md mt-4">
                           <h4 className="font-semibold text-gray-700 mb-3">Lettre de Voiture</h4>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center"><input type="checkbox" className="h-4 w-4 mr-2" checked={formData.lettreDeVoiture.tamponDuRelais} onChange={e => setFormData(prev => ({...prev, lettreDeVoiture: {...prev.lettreDeVoiture, tamponDuRelais: e.target.checked }}))} /> Tampon du relais</label>
                                <label className="flex items-center"><input type="checkbox" className="h-4 w-4 mr-2" checked={formData.lettreDeVoiture.horaireDePassageLocker} onChange={e => setFormData(prev => ({...prev, lettreDeVoiture: {...prev.lettreDeVoiture, horaireDePassageLocker: e.target.checked }}))} /> Horaire de passage casier</label>
                            </div>
                        </div>
                        
                        {/* Saturation Lockers */}
                        <div className="p-4 border rounded-md mt-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Incident : Saturation Casier</h4>
                            {formData.saturationLockers.map((item, index) => (
                                <div key={item.id} className="p-3 mb-2 border rounded-lg bg-gray-50 space-y-2">
                                    <div className="flex justify-between items-center">
                                       <span className="text-sm font-medium text-gray-600">Saturation #{index + 1}</span>
                                       <button type="button" onClick={() => removeFromList('saturationLockers', item.id)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
                                    </div>
                                    <input type="text" placeholder="Nom du Casier" value={item.lockerName} onChange={e => handleListChange('saturationLockers', item.id, 'lockerName', e.target.value)} className="w-full p-2 border rounded-md" required />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Sacs</label>
                                            <input type="number" placeholder="Nº" value={item.sacs} onChange={e => handleListChange('saturationLockers', item.id, 'sacs', parseInt(e.target.value) || 0)} min="0" className="w-full p-2 border rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Vracs</label>
                                            <input type="number" placeholder="Nº" value={item.vracs} onChange={e => handleListChange('saturationLockers', item.id, 'vracs', parseInt(e.target.value) || 0)} min="0" className="w-full p-2 border rounded-md" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={() => addToList('saturationLockers', { lockerName: '', sacs: 0, vracs: 0 })} className="mt-2 text-sm text-[#9c0058] hover:text-[#86004c] font-semibold">+ Ajouter Saturation</button>
                        </div>
                        
                        {/* Livraison Manquante */}
                        <div className="p-4 border rounded-md mt-4">
                             <h4 className="font-semibold text-gray-700 mb-2">Incident : Livraison Manquante</h4>
                             {formData.livraisonsManquantes.map((item, index) => (
                                <div key={item.id} className="p-3 mb-2 border rounded-lg bg-gray-50 space-y-2">
                                     <div className="flex justify-between items-center">
                                       <span className="text-sm font-medium text-gray-600">Livraison Manquante #{index + 1}</span>
                                       <button type="button" onClick={() => removeFromList('livraisonsManquantes', item.id)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
                                    </div>
                                    <input type="text" placeholder="Nom PUDO/APM" value={item.pudoApmName} onChange={e => handleListChange('livraisonsManquantes', item.id, 'pudoApmName', e.target.value)} className="w-full p-2 border rounded-md" required />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Sacs</label>
                                            <input type="number" placeholder="Nº" value={item.sacs} onChange={e => handleListChange('livraisonsManquantes', item.id, 'sacs', parseInt(e.target.value) || 0)} min="0" className="w-full p-2 border rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Vracs</label>
                                            <input type="number" placeholder="Nº" value={item.vracs} onChange={e => handleListChange('livraisonsManquantes', item.id, 'vracs', parseInt(e.target.value) || 0)} min="0" className="w-full p-2 border rounded-md" />
                                        </div>
                                    </div>
                                </div>
                             ))}
                             <button type="button" onClick={() => addToList('livraisonsManquantes', { pudoApmName: '', sacs: 0, vracs: 0 })} className="mt-2 text-sm text-[#9c0058] hover:text-[#86004c] font-semibold">+ Ajouter Livraison Manquante</button>
                        </div>
                        
                        {/* PUDO/APM Fermé */}
                        <div className="p-4 border rounded-md mt-4">
                             <h4 className="font-semibold text-gray-700 mb-2">Incident : PUDO/APM Fermé</h4>
                             {formData.pudosApmFermes.map((item, index) => (
                                <div key={item.id} className="p-3 mb-2 border rounded-lg bg-gray-50 space-y-2">
                                     <div className="flex justify-between items-center">
                                       <span className="text-sm font-medium text-gray-600">Fermeture #{index + 1}</span>
                                       <button type="button" onClick={() => removeFromList('pudosApmFermes', item.id)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
                                    </div>
                                    <input type="text" placeholder="Nom PUDO/APM" value={item.pudoApmName} onChange={e => handleListChange('pudosApmFermes', item.id, 'pudoApmName', e.target.value)} className="w-full p-2 border rounded-md" required />
                                    <select value={item.reason} onChange={e => handleListChange('pudosApmFermes', item.id, 'reason', e.target.value as PudoApmFermeReason)} className="w-full p-2 border rounded-md mt-2">
                                        <option value={PudoApmFermeReason.CIERRE_SALVAJE}>Fermeture sauvage</option>
                                        <option value={PudoApmFermeReason.PANNE}>Panne</option>
                                    </select>
                                </div>
                             ))}
                             <button type="button" onClick={() => addToList('pudosApmFermes', { pudoApmName: '', reason: PudoApmFermeReason.CIERRE_SALVAJE })} className="mt-2 text-sm text-[#9c0058] hover:text-[#86004c] font-semibold">+ Ajouter Fermeture PUDO/APM</button>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Notes Supplémentaires</label>
                            <textarea value={formData.notes} onChange={e => setFormData(prev => ({...prev, notes: e.target.value}))} rows={3} className="w-full p-2 border rounded-md mt-1"></textarea>
                        </div>
                    </div>
                    <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3">
                         <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Annuler</button>
                         <button type="submit" className="bg-[#9c0058] text-white px-4 py-2 rounded-lg hover:bg-[#86004c]" disabled={!formData.selectedCheckinId}>
                            {isEditMode ? 'Enregistrer les Modifications' : 'Enregistrer le Rapport'}
                         </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReturnReportFormModal;