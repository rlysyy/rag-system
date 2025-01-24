import { useState, useEffect, useCallback } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { testDataDefectRate, dailyDefectRates } from '@/lib/mockData/test-data-defectRate';
import { generateChartColors } from '@/lib/utils/colors';
import { ChartProps, ChartDataItem, ChartDataType } from '@/types/data';
import { useDefectRate } from '@/hooks/useDefectRate';

// 使用定义的类型
const data: ChartDataType[] = [
  // ... 你的数据
];

export function DefectRateStackChart({ chartWidth }: ChartProps) {
  const { chartData, errorTypes, hiddenBars, handleLegendClick } = useDefectRate();

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width={chartWidth + 40} height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 45, left: 0, bottom: 5 }}
          barSize={60}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            fontSize={14}
            interval={0}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis 
            yAxisId="left"
            fontSize={14}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tickFormatter={(value) => `${value}%`}
            fontSize={14}
            width={40}
          />
          <Tooltip 
            formatter={(value: any, name: string) => {
              if (name === '不良率') {
                return [`${value}%`, name];
              }
              return [value, name];
            }}
            itemSorter={(item) => {
              if (item.name === '不良率') return -999;  // 不良率始终在最上方
              return -Number(item.value || 0);          // 其他按数值降序
            }}
          />
          <Legend 
            onClick={({ id = '' }) => handleLegendClick(id)}
            wrapperStyle={{ 
              left: 0, 
              paddingTop: '10px',
              fontFamily: 'Noto Sans SC, Noto Sans JP',
              fontSize: '12px'
            }}
            iconType="circle"
            iconSize={10}
            payload={[
              { 
                value: errorTypes.some(type => hiddenBars[type]) ? '全选' : '取消全选', 
                type: 'circle' as const, 
                id: 'all',
                color: '#8884d8'
              },
              ...errorTypes.map((type, index) => ({
                value: type,
                type: 'circle' as const,
                color: generateChartColors(errorTypes.length)[index],
                id: type
              }))
            ]}
          />
          {errorTypes.map((type, index) => (
            <Bar
              key={`bar-${type}-${index}`}
              dataKey={type}
              stackId="a"
              yAxisId="left"
              fill={generateChartColors(errorTypes.length)[index]}
              hide={hiddenBars[type]}
            />
          ))}
          <Line
            type="monotone"
            dataKey="total_defect_rate"
            stroke="#d32f2f"
            yAxisId="right"
            name="不良率"
            dot={{ fill: '#d32f2f' }}
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
} 