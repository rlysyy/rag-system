import { useState, useEffect, useCallback } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import { testDataDefectRate, dailyDefectRates } from '@/lib/mockData/test-data-defectRate';
import { generateChartColors } from '@/lib/utils/colors';

// 定义图表数据项的接口
interface ChartDataItem {
  date: string;
  [key: string]: number | string;  // 动态键值对，用于存储不同类型的不良数量
}

export function DefectRateStackChart({ chartWidth }: { chartWidth: number }) {
  // 状态管理
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);  // 图表数据
  const [errorTypes, setErrorTypes] = useState<string[]>([]);        // 不良类型列表
  const [hiddenBars, setHiddenBars] = useState<Record<string, boolean>>({});  // 控制每种不良类型的显示/隐藏

  // 初始化数据
  useEffect(() => {
    // 使用 reduce 将原始数据按日期分组
    const groupedData = testDataDefectRate.reduce((acc: Record<string, ChartDataItem>, curr) => {
      const date = curr.dttime.split('-').slice(1).join('-');  // 提取月-日
      if (!acc[date]) {
        acc[date] = { 
          date,
          total_defect_rate: dailyDefectRates[curr.dttime] || 0  // 添加不良率数据
        };
      }
      acc[date][curr.ngid] = (Number(acc[date][curr.ngid]) || 0) + curr.count;
      return acc;
    }, {});

    setChartData(Object.values(groupedData));
    // 获取所有不良类型（去重）
    const types = [...new Set(testDataDefectRate.map(item => item.ngid))];
    setErrorTypes(types);
    
    // 初始化显示状态（默认全部显示）
    const initialHiddenBars: Record<string, boolean> = {};
    types.forEach(type => {
      initialHiddenBars[type] = false;
    });
    setHiddenBars(initialHiddenBars);
  }, []);

  // 处理图例点击事件
  const handleLegendClick = useCallback((dataKey: string) => {
    if (dataKey === 'all') {
      // 处理"全选/取消全选"
      const newHiddenBars: Record<string, boolean> = {};
      const shouldShow = errorTypes.some(type => hiddenBars[type]);  // 检查是否有隐藏的类型
      errorTypes.forEach(type => {
        newHiddenBars[type] = !shouldShow;  // 统一设置显示状态
      });
      setHiddenBars(newHiddenBars);
    } else {
      // 处理单个类型的显示/隐藏
      setHiddenBars(prev => {
        const newHiddenBars = { ...prev };
        newHiddenBars[dataKey] = !prev[dataKey];  // 切换显示状态
        return newHiddenBars;
      });
    }
  }, [errorTypes, hiddenBars]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width={chartWidth} height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          {/* 网格线 */}
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            fontSize={14}
          />
          {/* 左侧Y轴：不良数量 */}
          <YAxis yAxisId="left" />
          {/* 右侧Y轴：不良率（百分比） */}
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tickFormatter={(value) => `${value}%`}
          />
          {/* 提示框配置 */}
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
          {/* 图例配置 */}
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
              // 全选/取消全选按钮
              { 
                value: errorTypes.some(type => hiddenBars[type]) ? '全选' : '取消全选', 
                type: 'circle' as const, 
                id: 'all',
                color: '#8884d8'
              },
              // 各不良类型的图例
              ...errorTypes.map((type, index) => ({
                value: type,
                type: 'circle' as const,
                color: generateChartColors(errorTypes.length)[index],
                id: type
              }))
            ]}
          />
          {/* 隐藏的全选Bar */}
          <Bar
            dataKey="all"
            stackId="a"
            fill="#8884d8"
            hide={true}
            yAxisId="left"
          />
          {/* 各不良类型的堆叠柱状图 */}
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
          {/* 不良率曲线 */}
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