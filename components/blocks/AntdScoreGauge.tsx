'use client';
import React from 'react';
import { Gauge, GaugeConfig } from '@ant-design/plots';

interface AntdScoreGaugeProps {
  value: number;
  max: number;
  thresholds?: number[];
  colors?: string[];
}
const keyTicks = [0,16, 17, 18.5, 25, 30, 35, 40];

const AntdScoreGauge: React.FC<AntdScoreGaugeProps> = ({
  value,
  max,
  thresholds = [0, 16, 17, 18.5, 25, 30, 35, 40],
  colors = ['#ef4444', '#ef4444', '#facc15',  '#facc15', '#22c55e','#facc15', '#ef4444'],
}) => {
  const config:GaugeConfig = {
    autoFit: true,
    data: {
      target: value,
      total: max,
      name: 'score',
      thresholds,
    },
    scale: {
      color: {
        range: colors,
      },
    },
    axis: {
      tick: keyTicks,
      style: {
        labelFontSize: 16,
        labelFill: '#888',
      },
    },
    style: {
      textContent: (target: number, total: number) =>
        ``,
    },
  };
  return <Gauge {...config} />;
};

export default AntdScoreGauge; 