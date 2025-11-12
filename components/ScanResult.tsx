import React from 'react';
import { ScanStatus, type ScanResult as ScanResultType } from '../types';

interface ScanResultProps {
  result: ScanResultType;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-green-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const ExclamationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
);


const ScanResult: React.FC<ScanResultProps> = ({ result }) => {
  if (result.status === ScanStatus.IDLE) {
    return (
        <div className="h-28 flex items-center justify-center text-gray-500 italic">
            Esperando escaneo...
        </div>
    );
  }

  const isSuccess = result.status === ScanStatus.SUCCESS;
  const isError = result.status === ScanStatus.ERROR;

  const bgColor = isSuccess ? 'bg-green-50' : isError ? 'bg-red-50' : 'bg-blue-50';
  const borderColor = isSuccess ? 'border-green-300' : isError ? 'border-red-300' : 'border-blue-300';
  const title = isSuccess ? 'Acceso Correcto' : isError ? 'Error en el Escaneo' : 'Información';
  const titleColor = isSuccess ? 'text-green-800' : isError ? 'text-red-800' : 'text-blue-800';
  const textColor = isSuccess ? 'text-green-700' : isError ? 'text-red-700' : 'text-blue-700';

  const Icon = () => {
    switch (result.status) {
        case ScanStatus.SUCCESS: return <CheckIcon />;
        case ScanStatus.ERROR: return <ExclamationIcon />;
        case ScanStatus.INFO: return <InfoIcon />;
        default: return null;
    }
  }

  return (
    <div className={`mt-4 p-4 rounded-lg border ${bgColor} ${borderColor} flex items-center space-x-4 transition-all duration-300`}>
      <div>
        <Icon />
      </div>
      <div>
        <p className={`text-lg font-semibold ${titleColor}`}>
          {title}
        </p>
        <p className={`${textColor}`}>
          {result.message}
        </p>
      </div>
    </div>
  );
};

export default ScanResult;