import React, { useState, useEffect, useRef } from 'react';
import { Driver } from '../types';

interface VehiclePlateEntryProps {
    driver: Driver;
    onPlateSubmit: (plate: string) => void;
}

const VehiclePlateEntry: React.FC<VehiclePlateEntryProps> = ({ driver, onPlateSubmit }) => {
    const [plate, setPlate] = useState(driver.vehiclePlate || '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (plate.trim()) {
            onPlateSubmit(plate.trim());
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">¡Hola, {driver.name}!</h1>
                    <p className="text-gray-500 mt-2">Para continuar, por favor introduce la matrícula de tu vehículo para hoy.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="plate-input" className="block text-sm font-medium text-gray-700">
                            Matrícula del Vehículo
                        </label>
                        <input
                            ref={inputRef}
                            id="plate-input"
                            type="text"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value.toUpperCase())}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg font-mono text-center"
                            required
                            placeholder="Ej: 1234-ABC"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={!plate.trim()}
                    >
                        Registrar Entrada y Continuar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VehiclePlateEntry;