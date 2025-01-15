import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface ChartDataItem {
  count: number;
  ngid: string;
  dttime: string;
}

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F']; // 预定义颜色

const StackedChart = ({ data }: { data: ChartDataItem[] }) => {
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

  return (
    <BarChart
      width={chartDataArray.length * 98} // 动态宽度，每个日期占 96px
      height={400}
      data={chartDataArray}
      margin={{ top: 5, right: 0, left: 0, bottom: 5 }} // 减少边距
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
      dataKey="date" 
      interval={0} // 显示所有日期
      tick={{ fontSize: 14 }} // 调整字体大小
    />
    <YAxis />
    <Tooltip />
    <Legend 
      wrapperStyle={{ paddingBottom: 20 }} // 添加底部 padding
      verticalAlign="top" // 将 Legend 放在顶部
    />
    {ngids.map((ngid, index) => (
      <Bar 
        key={ngid} 
        dataKey={ngid} 
        stackId="a" 
        fill={colors[index % colors.length]} // 使用固定颜色
        barSize={98} // 设置每个柱子的宽度为 98 像素
      />
    ))}
    </BarChart>
  );
};

export default StackedChart; 