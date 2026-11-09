import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showLabel = false,
  size = 'md',
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-gray-400">Funding Progress</span>
          <span className="text-cyan-400 font-semibold">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-[#1A2338] rounded-full overflow-hidden border border-[#22304E] ${heightClass}`}>
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(0,229,255,0.35)]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
