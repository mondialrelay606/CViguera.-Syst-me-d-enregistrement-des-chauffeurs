import React from 'react';

interface HourlyCheckinChartProps {
  data: number[]; // Array de 24 elementos con el recuento por hora
}

const HourlyCheckinChart: React.FC<HourlyCheckinChartProps> = ({ data }) => {
  const maxValue = Math.max(...data, 1); // Evitar división por cero
  const chartHeight = 200;
  const barWidth = 100 / 24;

  return (
    <div className="w-full h-[250px] p-4 border border-gray-200 rounded-lg">
      <svg width="100%" height="100%" viewBox="0 0 100 210" preserveAspectRatio="none">
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * chartHeight;
          const x = index * barWidth;
          const y = chartHeight - barHeight;
          return (
            <g key={index}>
              <rect
                x={`${x}%`}
                y={y}
                width={`${barWidth - 1}%`}
                height={barHeight}
                className="fill-current text-blue-500 hover:text-blue-700 transition-colors"
              />
              <text
                x={`${x + barWidth / 2}%`}
                y={chartHeight + 10}
                textAnchor="middle"
                className="text-[8px] fill-current text-gray-500"
              >
                {index.toString().padStart(2, '0')}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default HourlyCheckinChart;
