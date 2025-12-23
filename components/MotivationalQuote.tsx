
import React, { useMemo } from 'react';
import { MOTIVATIONAL_QUOTES } from '../constants';

export const MotivationalQuote: React.FC = () => {
  const quote = useMemo(() => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  }, []);

  return (
    <div className="bg-white border-2 border-gray-100 p-4 rounded-2xl mb-6 duo-shadow">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">💡</div>
        <div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Sabedoria do Dia</p>
          <p className="text-gray-800 font-medium italic text-sm leading-snug">"{quote}"</p>
        </div>
      </div>
    </div>
  );
};
