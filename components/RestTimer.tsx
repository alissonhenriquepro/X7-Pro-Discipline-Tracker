
import React, { useState, useEffect, useRef } from 'react';

export const RestTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(60);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (newTime?: number) => {
    const timeToSet = newTime !== undefined ? newTime : initialTime;
    if (newTime !== undefined) setInitialTime(newTime);
    setSeconds(timeToSet);
    setIsActive(false);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (seconds / initialTime) * 100;

  return (
    <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 duo-shadow mb-6 animate-in slide-in-from-top-4 duration-300">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cronômetro de Descanso</h3>
          <p className="text-3xl font-black text-gray-800 tabular-nums">{formatTime(seconds)}</p>
        </div>
        <div className="flex space-x-2">
          {[30, 60, 90].map((t) => (
            <button
              key={t}
              onClick={() => resetTimer(t)}
              className={`w-10 h-10 rounded-xl text-[10px] font-black border-b-2 transition-all ${
                initialTime === t && !isActive ? 'bg-blue-500 border-blue-700 text-white' : 'bg-gray-100 border-gray-200 text-gray-500'
              }`}
            >
              {t}s
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-3 bg-gray-100 rounded-full mb-4 overflow-hidden border-b-2 border-gray-200">
        <div 
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${seconds < 10 ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex space-x-3">
        <button
          onClick={toggleTimer}
          className={`flex-1 py-3 rounded-2xl font-black text-sm border-b-4 transition-all duo-button-active ${
            isActive 
              ? 'bg-orange-500 border-orange-700 text-white' 
              : 'bg-green-500 border-green-700 text-white'
          }`}
        >
          {isActive ? 'PAUSAR' : 'INICIAR DESCANSO'}
        </button>
        <button
          onClick={() => resetTimer()}
          className="px-6 py-3 bg-gray-100 border-b-4 border-gray-300 rounded-2xl font-black text-gray-500 text-sm transition-all duo-button-active"
        >
          RESET
        </button>
      </div>
      
      {seconds === 0 && (
        <p className="text-center text-red-500 font-black text-[10px] mt-3 animate-bounce uppercase">
          HORA DA PRÓXIMA SÉRIE! 🔥
        </p>
      )}
    </div>
  );
};
