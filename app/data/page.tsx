'use client'

import StackedChart from '@/components/data/StackedChart'
import { Factory4MTable } from '@/components/data/Factory4MTable'
import { testData } from './test-data'; // 导入原始数据
import { testDataNg } from './test-data-ng';

export default function DataPage() {
  // 获取所有日期
  const dates = Object.keys(testData.reduce((acc, item) => {
    const date = item.productdate.split('-').slice(1).join('-');
    acc[date] = true;
    return acc;
  }, {} as Record<string, boolean>));

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="min-w-[600px]">   
        {/* 堆积图 */}
        <div className="mb-8 overflow-x-auto" style={{ width: `${dates.length * 96 + 65}px` }}>
          <div style={{ width: `${dates.length * 96 + 65}px` }}>
            <StackedChart data={testDataNg} />
          </div>
        </div>

        {/* 表格 */}
        <Factory4MTable />
      </div>
    </div>
  )
}