import React, { useState, useEffect, ReactNode } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { testDataMicroStops } from '@/lib/mockData/test-data-microStops';
import { generateChartColors } from '@/lib/utils/colors';

interface ChartDataItem {
  date: string;
  [key: string]: number | string;
}

const MicroStopStack = (): ReactNode => {
  const [hiddenBars, setHiddenBars] = useState<Record<string, boolean>>({});
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [errorTypes, setErrorTypes] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const handleLegendClick = (entry: { dataKey: string }) => {
    const { dataKey } = entry;
    if (dataKey === 'all') {
      const newHiddenBars = isAllSelected
        ? errorTypes.reduce((acc, type) => ({ ...acc, [type]: true }), {})
        : {};
      setHiddenBars(newHiddenBars);
      setIsAllSelected(!isAllSelected);
    } else {
      setHiddenBars(prev => ({
        ...prev,
        [dataKey]: !prev[dataKey]
      }));
    }
  };

  useEffect(() => {
    const fetchData = () => {
      if (!testDataMicroStops || testDataMicroStops.length === 0) {
        console.error('No data found in testDataMicroStops');
        setIsLoading(false);
        return;
      }

      // 获取所有唯一日期
      const allDates = [...new Set(testDataMicroStops.map(item => {
        const originalDate = item.dttime;
        return originalDate.split('-').slice(1).join('-');
      }))].sort();

      // 创建包含所有日期的数据结构
      const groupedData = allDates.reduce((acc: Record<string, ChartDataItem>, date) => {
        acc[date] = { date };
        return acc;
      }, {});

      // 填充数据
      testDataMicroStops.forEach(item => {
        const formattedDate = item.dttime.split('-').slice(1).join('-');
        groupedData[formattedDate][item.errid] = (Number(groupedData[formattedDate][item.errid]) || 0) + item.total_errcount;
      });

      setChartData(Object.values(groupedData));
      setErrorTypes([...new Set(testDataMicroStops.map((item) => item.errid))]);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const colors = generateChartColors(errorTypes.length);

  const renderLegend = (props: any) => {
    const { payload } = props;

    return (
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px', 
        paddingTop: '20px',
        marginBottom: '20px',
        fontFamily: 'var(--font-noto-sans), var(--font-noto-sans-sc), var(--font-noto-sans-jp), sans-serif',
        fontSize: '14px'
      }}>
        <div
          style={{ 
            cursor: 'pointer', 
            color: isAllSelected ? '#000' : '#888',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onClick={() => handleLegendClick({ dataKey: 'all' })}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: isAllSelected ? '#1f77b4' : '#888',
              borderRadius: '2px'
            }}
          />
          {isAllSelected ? '全不选' : '全选'}
        </div>

        {payload.map((entry: any, index: number) => (
          <div
            key={`item-${index}`}
            style={{ 
              cursor: 'pointer', 
              color: hiddenBars[entry.dataKey] ? '#888' : '#000',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onClick={() => handleLegendClick(entry)}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: hiddenBars[entry.dataKey] ? '#888' : entry.color,
                borderRadius: '2px'
              }}
            />
            {entry.value}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (errorTypes.length > 0) {
      const initialHiddenBars = errorTypes.reduce((acc, type) => ({
        ...acc,
        [type]: false
      }), {});
      setHiddenBars(initialHiddenBars);
    }
  }, [errorTypes]);

  // 计算总宽度：每个日期单元格宽度(96px) * 日期数量
  const calculateWidth = () => {
    // 添加一些边距，确保图表完整显示
    return `${chartData.length * 95 + 100}px`;
  };

  return (
    <div 
      className="h-[400px] relative"
      style={{ width: calculateWidth() }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 14 }}
            interval={0}
            padding={{ left: 0, right: 0 }}  // 移除 X 轴两端的空白
          />
          <YAxis />
          <Tooltip />
          <Legend 
            content={renderLegend}
            wrapperStyle={{ 
              maxWidth: '100%',
              overflow: 'hidden',
              maxHeight: '150px',
              paddingTop: '20px',
              marginBottom: '20px'
            }}
            verticalAlign="top"
          />
          {errorTypes.map((type, index) => (
            <Bar
              key={type}
              dataKey={type}
              stackId="a"
              fill={colors[index]}
              barSize={60}
              hide={hiddenBars[type]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 10,
          }}
        >
          <div>Loading...</div>
        </div>
      )}
    </div>
  );
};

export default MicroStopStack;