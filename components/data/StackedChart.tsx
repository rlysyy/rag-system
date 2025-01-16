import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface ChartDataItem {
  count: number;
  ngid: string;
  dttime: string;
}

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F']; // 预定义颜色

const StackedChart = ({ data }: { data: ChartDataItem[] }) => {
  const [chartDataArray, setChartDataArray] = useState<Array<{ date: string } & Record<string, number>>>([]);
  const [ngids, setNgids] = useState<string[]>([]);
  const [hiddenNgids, setHiddenNgids] = useState<string[]>([]); // 新增：存储隐藏的 ngid

  // 处理 Legend 点击事件
  const handleLegendClick = (ngid: string) => {
    setHiddenNgids((prev) =>
      prev.includes(ngid) ? prev.filter((id) => id !== ngid) : [...prev, ngid]
    );
  };

  useEffect(() => {
    // 转换数据格式
    const chartData = data.reduce<Record<string, { date: string } & Record<string, number>>>((acc, item) => {
      const date = item.dttime.split('-').slice(1).join('-'); // 转换为 12-01 格式
      if (!acc[date]) acc[date] = { date } as { date: string } & Record<string, number>;

      // 按 ngid 累加 count
      acc[date][item.ngid] = (acc[date][item.ngid] || 0) + item.count;
      return acc;
    }, {});

    // 转换为数组格式
    const chartDataArray = Object.values(chartData);

    // 获取所有 ngid 作为堆积图的分类
    const ngids = [...new Set(data.map(item => item.ngid))];

    setChartDataArray(chartDataArray);
    setNgids(ngids);
  }, [data]);

  if (!chartDataArray.length || !ngids.length) {
    return null; // 或者返回一个加载指示器
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-center text-primary">
        小停机统计
      </h2>
      
      <BarChart
        width={chartDataArray.length * 98}
        height={400}
        data={chartDataArray}
        margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          interval={0}
          tick={{ fontSize: 14 }}
        />
        <YAxis />
        <Tooltip />
        <Legend 
          wrapperStyle={{ paddingBottom: 20 }}
          verticalAlign="top"
          onClick={(e) => handleLegendClick(e.value)} // 添加点击事件
        />
        {ngids.map((ngid, index) => (
          <Bar 
            key={ngid} 
            dataKey={ngid} 
            stackId="a" 
            fill={colors[index % colors.length]}
            barSize={60}
            hide={hiddenNgids.includes(ngid)} // 控制显示/隐藏
          />
        ))}
      </BarChart>
    </div>
  );
};

export default StackedChart;