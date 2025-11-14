import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <p className="mt-1 text-4xl font-semibold text-gray-900">{value}</p>
    </div>
  );
};

export default SummaryCard;