'use client';
import React from 'react';

interface AntdScoreGaugeProps {
  value: number;
  max: number;
  size?: number;
}

export default function AntdScoreGauge({ value, max, size = 120 }: AntdScoreGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (bmi: number) => {
    if (bmi < 18.5) return '#3B82F6';
    if (bmi < 25) return '#22C55E';
    if (bmi < 30) return '#FACC15';
    if (bmi < 35) return '#F97316';
    if (bmi < 40) return '#EF4444';
    return '#DC2626';
  };

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(value)}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold" style={{ color: getColor(value) }}>
            {value.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">BMI</div>
        </div>
      </div>
    </div>
  );
} 