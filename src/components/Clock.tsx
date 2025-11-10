import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const Clock: React.FC = () => {
  const { language } = useTranslation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="text-center">
      <p className="text-5xl md:text-6xl font-bold">
        {time.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="text-lg opacity-80">
        {time.toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
};

export default Clock;