import React from 'react';
import { Legend } from 'recharts';

interface CustomLegendProps {
  onClick: (id: string) => void;
  isAllSelected: boolean;
  errorTypes: string[];
  hiddenBars: Record<string, boolean>;
  generateChartColors: (length: number) => string[];
}

export const CustomLegend = ({
  onClick,
  isAllSelected,
  errorTypes,
  hiddenBars,
  generateChartColors
}: CustomLegendProps) => {
  const legendPayload = React.useMemo(() => {
    return [
      {
        value: errorTypes.some(type => hiddenBars[type]) ? '全选' : '取消全选',
        type: 'circle',
        id: 'all',
        color: '#8884d8'
      },
      ...errorTypes.map((type, index) => ({
        value: type,
        type: 'circle',
        color: generateChartColors(errorTypes.length)[index],
        id: type,
        payload: { dataKey: type }
      }))
    ];
  }, [errorTypes, hiddenBars, generateChartColors]);

  return (
    <Legend
      content={({ payload }) => (
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          fontFamily: 'Noto Sans SC, Noto Sans JP',
          fontSize: '12px',
          position: 'relative',
          left: '50px'
        }}>
          {legendPayload.map((entry, index) => (
            <li
              key={`item-${index}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                marginRight: '16px'
              }}
              onClick={() => onClick(entry.id)}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                  marginRight: '4px'
                }}
              />
              <span>{entry.value}</span>
            </li>
          ))}
        </ul>
      )}
    />
  );
}; 