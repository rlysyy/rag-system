interface MockResponse {
  content: string;
  references?: Array<{ id: string; name: string; }>;
}

export const mockResponses: MockResponse[] = [
  {
    content: `好的，让我为您介绍一下工厂数据分析的主要功能：

1. 小停机分析
- 实时监控设备停机情况
- 统计停机原因和持续时间
- 生成停机趋势分析图表

2. 4M数据追踪
- Man：操作员工作记录
- Machine：设备运行状态
- Material：原材料使用情况
- Method：工艺参数监控

3. 预兆保全
- 设备运行参数监测
- 异常预警提示
- 维护建议生成

4. 不良率分析
- 产品质量追踪
- 不良原因分类
- 改善方案推荐

需要了解具体哪个方面的详细信息吗？`,
    references: [
      {
        id: 'fe3957d2c73511ef9c940242ac120006',
        name: '埃泰克_G8K-27R-30Z3N11_最终报告_20240718.pdf'
      }
    ]
  },
  {
    content: `从图表中可以看出以下几个关键点：

1. 设备状态
⚠️ 轴承温度略高
⚠️ 振动值波动增大
✅ 其他参数正常

2. 质量状况
❗ 不良率有上升趋势
❗ A类缺陷占比最大
❗ 需要重点关注工艺参数

3. 改善建议
➡️ 加强操作员培训
➡️ 优化预防性维护
➡️ 更新设备保养计划

您想深入了解哪个方面的数据吗？`,
    references: [
      {
        id: 'fe3957d2c73511ef9c940242ac120006',
        name: '埃泰克_G8K-27R-30Z3N11_最终报告_20240718.pdf'
      },
      {
        id: 'fe3957d2c73511ef9c940242ac120007',
        name: '设备维护手册_2024.pdf'
      }
    ]
  },
  {
    content: `根据系统记录，最近的异常情况分析如下：

1. 设备状态
⚠️ 轴承温度略高
⚠️ 振动值波动增大
✅ 其他参数正常

2. 建议措施
🔴 检查润滑情况（高优先级）
🟡 调整运行参数（中优先级）
🟢 安排预防性维护（低优先级）

3. 后续行动
📋 制定检修计划
📝 更新维护手册
👥 培训维护人员

需要我生成详细的维护计划吗？`
  }
]

export function getMockResponse() {
  const randomIndex = Math.floor(Math.random() * mockResponses.length)
  const response = mockResponses[randomIndex]
  return {
    content: response.content,
    references: response.references
  }
} 