import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';

export type IconName = 'home' | 'dms' | 'activity' | 'search' | 'more';
type Props = { name: IconName; color: string; size?: number };

// Feather-style line icons. Self-contained SVG — no font linking needed.
export function Icon({ name, color, size = 24 }: Props) {
  const p = {
    stroke: color,
    strokeWidth: 2,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const box = { width: size, height: size, viewBox: '0 0 24 24' };

  switch (name) {
    case 'home':
      return (
        <Svg {...box}>
          <Path {...p} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Path {...p} d="M9 22V12h6v10" />
        </Svg>
      );
    case 'dms':
      return (
        <Svg {...box}>
          <Path
            {...p}
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
          />
        </Svg>
      );
    case 'activity':
      return (
        <Svg {...box}>
          <Path {...p} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path {...p} d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
      );
    case 'search':
      return (
        <Svg {...box}>
          <Circle {...p} cx="11" cy="11" r="8" />
          <Line {...p} x1="21" y1="21" x2="16.65" y2="16.65" />
        </Svg>
      );
    case 'more':
      return (
        <Svg {...box}>
          <Circle {...p} cx="12" cy="12" r="1" />
          <Circle {...p} cx="19" cy="12" r="1" />
          <Circle {...p} cx="5" cy="12" r="1" />
        </Svg>
      );
  }
}
