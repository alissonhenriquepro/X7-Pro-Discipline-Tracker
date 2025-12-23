
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, colorClass = "bg-green-500" }) => {
  const percentage = Math.min(Math.max((current / total) * 100, 0), 100);

  return (
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden relative border-b-2 border-gray-300">
      <div 
        className={`h-full ${colorClass} transition-all duration-500 ease-out rounded-full`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
