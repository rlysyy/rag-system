'use client'

import { Factory4MTable } from '@/components/data/Factory4MTable'
import { testData } from '@/lib/mockData/test-data';
import { MicroStopStackChart } from '@/components/data/MicroStopStackChart';
import { DefectRateStackChart } from '@/components/data/DefectRateStackChart';
import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

export default function DataPage() {
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [isMicroStopVisible, setIsMicroStopVisible] = useState(true);
  const [isDefectRateVisible, setIsDefectRateVisible] = useState(true);

  // 获取所有日期并排序
  const dates = Object.keys(testData.reduce((acc, item) => {
    const date = item.productdate.split('-').slice(1).join('-');
    acc[date] = true;
    return acc;
  }, {} as Record<string, boolean>)).sort();

  // 分别计算图表和表格的宽度
  const chartWidth = dates.length * 98 + 75;  // 图表宽度保持原样

  // 切换图表显示状态
  const handleToggle = useCallback((setter: (value: boolean) => void, currentValue: boolean) => {
    requestAnimationFrame(() => {
      setter(!currentValue);
    });
  }, []);

  return (
    <div className="h-full overflow-y-auto p-4 bg-gray-50">
      <div className="min-w-[400px] space-y-2 overflow-x-auto pb-2">
        {/* 小停机堆积图 */}
        <div className="rounded-lg border shadow-sm bg-white" style={{ width: `${chartWidth}px` }}>
          <button 
            className="flex items-center w-full p-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleToggle(setIsMicroStopVisible, isMicroStopVisible)}
          >
            <div className="flex items-center flex-1">
              <span className="text-lg font-medium">小停机堆积图</span>
            </div>
            <div className={`transform transition-transform duration-200 ${isMicroStopVisible ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </button>
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden border-t`}
            style={{
              height: isMicroStopVisible ? '400px' : '0',
              opacity: isMicroStopVisible ? 1 : 0
            }}
          >
            <div className="p-4 h-[400px]">
              <MicroStopStackChart chartWidth={chartWidth - 32} />
            </div>
          </div>
        </div>

        {/* 数据表格 */}
        <div className="rounded-lg border shadow-sm bg-white" style={{ width: `${chartWidth}px` }}>
          <button 
            className="flex items-center w-full p-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleToggle(setIsTableVisible, isTableVisible)}
          >
            <div className="flex items-center flex-1">
              <span className="text-lg font-medium">数据表格</span>
            </div>
            <div className={`transform transition-transform duration-200 ${isTableVisible ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </button>
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden border-t`}
            style={{
              height: isTableVisible ? '400px' : '0',
              opacity: isTableVisible ? 1 : 0
            }}
          >
            <div className="p-4 h-[400px]">
              <Factory4MTable />
            </div>
          </div>
        </div>

        {/* 不良率堆积图 */}
        <div className="rounded-lg border shadow-sm bg-white" style={{ width: `${chartWidth}px` }}>
          <button 
            className="flex items-center w-full p-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleToggle(setIsDefectRateVisible, isDefectRateVisible)}
          >
            <div className="flex items-center flex-1">
              <span className="text-lg font-medium">不良率堆积图</span>
            </div>
            <div className={`transform transition-transform duration-200 ${isDefectRateVisible ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </button>
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden border-t`}
            style={{
              height: isDefectRateVisible ? '400px' : '0',
              opacity: isDefectRateVisible ? 1 : 0
            }}
          >
            <div className="p-4 h-[400px]">
              <DefectRateStackChart chartWidth={chartWidth - 32} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}