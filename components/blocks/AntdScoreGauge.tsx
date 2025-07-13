'use client';
import React from 'react';
import { Gauge } from '@ant-design/plots';
import { Path } from '@antv/g';

interface AntdScoreGaugeProps {
  value: number;
  max: number;
  thresholds?: number[];
  colors?: string[];
}
// WHO国际标准阈值
const keyTicks = [16, 18.5, 25, 30, 35, 40];

// 获取指针中心
function getOrigin(points: any[]) {
  if (points.length === 1) return points[0];
  const [[x0, y0, z0 = 0], [x2, y2, z2 = 0]] = points;
  return [(x0 + x2) / 2, (y0 + y2) / 2, (z0 + z2) / 2];
}

// 自定义指针 - 使用更好看的颜色
const customPointerShape = (style: any) => {
  return (points: any, value: any, coordinate: any, theme: any) => {
    const [x, y] = getOrigin(points);
    const [cx, cy] = coordinate.getCenter();
    const angle = Math.atan2(y - cy, x - cx);
    const length = 100; // 指针长度
    const width = 8;    // 指针底部宽度
    return new Path({
      style: {
        d: [
          ['M', cx + Math.cos(angle) * length, cy + Math.sin(angle) * length],
          ['L', cx + Math.cos(angle + Math.PI / 2) * width, cy + Math.sin(angle + Math.PI / 2) * width],
          ['L', cx + Math.cos(angle - Math.PI / 2) * width, cy + Math.sin(angle - Math.PI / 2) * width],
          ['Z'],
        ],
        fill: '#3B82F6', // 现代蓝色 - 更好看
        stroke: '#1E40AF', // 深蓝色边框
        strokeWidth: 1,
      },
    });
  };
};

const AntdScoreGauge: React.FC<AntdScoreGaugeProps> = ({
  value,
  max,
  thresholds = [0, 16, 18.5, 25, 30, 35, 40],
  colors = ['#ef4444','#ef4444', '#FACC15','#22C55E', '#FACC15', '#F97316', '#EF4444'],
}) => {
  const config = {
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
        labelFontSize: 12,
        labelFill: '#000',
      },
    },
    style: {
      pointerShape: customPointerShape, // 使用自定义指针
      pinShape: false, // 不显示圆心
      textContent: (target: number, total: number) => ``,
    },
    // 添加动画配置
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1000,
      },
      update: {
        animation: 'path-in',
        duration: 800,
        easing: 'easeInOut',
      },
    },
    // 指针动画
    pointer: {
      animation: {
        duration: 1000,
        easing: 'easeInOut',
      },
    },
  };
  return <Gauge {...config} />;
};

export default AntdScoreGauge; 