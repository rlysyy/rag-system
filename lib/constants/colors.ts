// 添加颜色常量配置
export const taskColors = {
  fault: 'rgb(254, 226, 226)',      // 故障 - 淡红色
  minorStop: 'rgb(254, 243, 199)',  // 小停机 - 淡黄色
  typeChange: 'rgb(219, 234, 254)', // 换型 - 淡蓝色
  setup: 'rgba(229, 231, 235, 0.2)', // 段取 - 超淡灰色（20%透明度）
  invalid: 'rgb(229, 231, 235)',    // 无效时间 - 淡灰色
  planned: 'rgb(251, 207, 232)',    // 计划停止 - 粉色
};

// 颜色说明数据
export const colorLegends = [
  { id: 1, name: '故障', color: taskColors.fault },
  { id: 2, name: '小停机', color: taskColors.minorStop },
  { id: 3, name: '换型', color: taskColors.typeChange },
  { id: 4, name: '段取', color: taskColors.setup },
  { id: 5, name: '无效时间', color: taskColors.invalid },
//   { id: 6, name: '计划停止', color: taskColors.planned }
];

// 根据任务ID获取背景色
export const getTaskBackgroundColor = (taskId: number | undefined) => {
  switch (taskId) {
    case 1: return taskColors.fault;
    case 2: return taskColors.minorStop;
    case 3: return taskColors.typeChange;
    case 4: return taskColors.setup;
    case 5: return taskColors.invalid;
    case 6: return taskColors.planned;
    default: return 'transparent';
  }
};

// 预兆保全颜色配置
export const maintenanceColors = {
  highAlert: taskColors.fault,      // 高等级报警 - 使用故障相同颜色
  lowAlert: taskColors.minorStop,   // 低等级报警 - 使用小停机相同颜色
  correction: taskColors.setup,     // 修正值 - 使用段取相同颜色
};

// 预兆保全颜色说明
export const maintenanceLegends = [
  { id: 1, name: '高等级报警', color: maintenanceColors.highAlert },
  { id: 2, name: '低等级报警', color: maintenanceColors.lowAlert },
  { id: 3, name: '修正值', color: maintenanceColors.correction },
]; 