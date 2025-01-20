import { useState, useEffect, useCallback } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import { testDataDefectRate, dailyDefectRates } from '@/lib/mockData/test-data-defectRate';
import { generateChartColors } from '@/lib/utils/colors';

interface ChartDataItem {
  date: string;
  [key: string]: number | string;
}

export function DefectRateStackChart({ chartWidth }: { chartWidth: number }) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [errorTypes, setErrorTypes] = useState<string[]>([]);
  const [hiddenBars, setHiddenBars] = useState<Record<string, boolean>>({});
  const [isAllSelected, setIsAllSelected] = useState(true);

  useEffect(() => {
    const groupedData = testDataDefectRate.reduce((acc: Record<string, ChartDataItem>, curr) => {
      const date = curr.dttime.split('-').slice(1).join('-');
      if (!acc[date]) {
        acc[date] = { 
          date,
          total_defect_rate: dailyDefectRates[curr.dttime] || 0
        };
      }
      acc[date][curr.ngid] = (Number(acc[date][curr.ngid]) || 0) + curr.count;
      return acc;
    }, {});

    console.log('Chart Data:', Object.values(groupedData));
    setChartData(Object.values(groupedData));
    const types = [...new Set(testDataDefectRate.map(item => item.ngid))] as string[];
    setErrorTypes(types);
    
    const initialHiddenBars: Record<string, boolean> = {};
    types.forEach(type => {
      initialHiddenBars[type] = false;
    });
    setHiddenBars(initialHiddenBars);
  }, []);

  const handleLegendClick = useCallback((dataKey: string) => {
    if (dataKey === 'all') {
      const newHiddenBars: Record<string, boolean> = {};
      const shouldShow = errorTypes.some(type => hiddenBars[type]);
      
      errorTypes.forEach(type => {
        newHiddenBars[type] = !shouldShow;
      });
      
      setHiddenBars(newHiddenBars);
      setIsAllSelected(shouldShow);
    } else {
      setHiddenBars(prev => {
        const newHiddenBars = { ...prev };
        newHiddenBars[dataKey] = !prev[dataKey];
        
        const allHidden = errorTypes.every(type => newHiddenBars[type]);
        setIsAllSelected(!allHidden);
        
        return newHiddenBars;
      });
    }
  }, [errorTypes, hiddenBars]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width={chartWidth} height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            fontSize={14}
          />
          <YAxis yAxisId="left" />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value: any, name: string) => {
              if (name === '不良率') {
                return [`${value}%`, name];
              }
              return [value, name];
            }}
            itemSorter={(item) => {
              if (item.name === '不良率') return -1;
              return 0;
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
          <Bar
            dataKey="all"
            stackId="a"
            fill="#8884d8"
            hide={true}
            yAxisId="left"
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
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
} 