import React from 'react';

interface ChartTitleProps {
  children: React.ReactNode;
}

const ChartTitle: React.FC<ChartTitleProps> = ({ children }) => (
  <h3 className="text-lg font-bold text-center text-gray-700 mb-4">{children}</h3>
);

export default ChartTitle;