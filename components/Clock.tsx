import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="text-center">
      <p className="text-5xl md:text-6xl font-bold text-gray-800">
        {time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="text-lg text-gray-500">
        {time.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
};

export default Clock;
