import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { testDataNg } from '@/lib/mockData/test-data-ng';
import { generateChartColors } from '@/lib/utils/colors'; // 导入颜色工具函数

const DefectRateStackChart = () => {
  const [hiddenBars, setHiddenBars] = useState<Record<string, boolean>>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [errorTypes, setErrorTypes] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(true); // 全选状态

  // 处理 Legend 单击事件
  const handleLegendClick = (entry: { dataKey: string }) => {
    const { dataKey } = entry;

    // 如果是全选/全不选 Legend
    if (dataKey === 'all') {
      const newHiddenBars = isAllSelected
        ? errorTypes.reduce((acc, type) => ({ ...acc, [type]: true }), {})
        : {};
      setHiddenBars(newHiddenBars);
      setIsAllSelected(!isAllSelected);
    } else {
      // 普通 Legend 点击
      setHiddenBars((prevHiddenBars) => ({
        ...prevHiddenBars,
        [dataKey]: !prevHiddenBars[dataKey]
      }));
    }
  };

  // 数据获取逻辑
  useEffect(() => {
    const fetchData = () => {
      const groupedData = testDataNg.reduce((acc: Record<string, any>, curr) => {
        // 确保 dttime 存在且是字符串
        if (!curr.dttime || typeof curr.dttime !== 'string') {
          console.warn('Invalid dttime:', curr.dttime);
          return acc;
        }

        const originalDate = curr.dttime;
        const formattedDate = originalDate.split('-').slice(1).join('-'); // 格式化为 "MM-DD"
        if (!acc[formattedDate]) {
          acc[formattedDate] = { date: formattedDate };
        }
        acc[formattedDate][curr.ngid] = (acc[formattedDate][curr.ngid] || 0) + curr.count;
        return acc;
      }, {});

      setChartData(Object.values(groupedData));
      setErrorTypes([...new Set(testDataNg.map((item) => item.ngid))]); // 使用 ngid 作为不良类型
    };

    fetchData();
  }, []);

  // 使用封装的颜色工具函数
  const colors = generateChartColors(errorTypes.length);

  // 自定义 Legend 内容
  const renderLegend = (props: { payload: { dataKey: string; color: string }[] }) => {
    const { payload } = props;

    return (
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px', 
        paddingTop: '20px',
        marginBottom: '20px',
        fontFamily: 'var(--font-noto-sans), var(--font-noto-sans-sc), var(--font-noto-sans-jp), sans-serif',
        fontSize: '14px' // 显式设置字体大小
      }}>
        {/* 全选/全不选 Legend */}
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

        {/* 普通 Legend */}
        {payload.map((entry: { dataKey: string; color: string }, index: number) => (
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
            {entry.dataKey} {/* 显示 ngid */}
          </div>
        ))}
      </div>
    );
  };

  // 添加宽度计算函数
  const calculateWidth = () => {
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
            padding={{ left: 0, right: 0 }}
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
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DefectRateStackChart; 