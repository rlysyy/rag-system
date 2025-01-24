// 图表相关类型
export interface ChartDataItem {
  date: string;
  [key: string]: number | string;
}

export interface ChartDataType {
  name: string;
  value: number;
}

export interface ChartProps {
  chartWidth: number;
}

// 维护表相关类型
export interface TestDataMaintenance {
  the_date: string;
  UnitID: number;
  remarks: string;
}

export interface MaintenanceTableProps {
  data: TestDataMaintenance[];
  unitIds: number[];
}

// 4M表格相关类型
export interface TaskData {
  text: string;
  task_stop_id: number;
} 