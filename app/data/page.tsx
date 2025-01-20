'use client'

import { Factory4MTable } from '@/components/data/Factory4MTable'
import { testData } from '../../lib/mockData/test-data';
import { MicroStopStackChart } from '@/components/data/MicroStopStackChart';
import { DefectRateStackChart } from '@/components/data/DefectRateStackChart';
import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function DataPage() {
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [isMicroStopVisible, setIsMicroStopVisible] = useState(true);
  const [isDefectRateVisible, setIsDefectRateVisible] = useState(true);

  // 获取所有日期
  const dates = Object.keys(testData.reduce((acc, item) => {
    const date = item.productdate.split('-').slice(1).join('-');
    acc[date] = true;
    return acc;
  }, {} as Record<string, boolean>));

  // 计算图表宽度
  const chartWidth = dates.length * 97 +75;

  const handleToggle = useCallback((setter: (value: boolean) => void, currentValue: boolean) => {
    requestAnimationFrame(() => {
      setter(!currentValue);
    });
  }, []);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="min-w-[400px] space-y-4">   
        {/* 小停机堆积图 */}
        <div>
          <button 
            className="flex items-center w-full text-left cursor-pointer mb-2 select-none"
            onClick={() => handleToggle(setIsMicroStopVisible, isMicroStopVisible)}
          >
            {isMicroStopVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span className="ml-1">小停机堆积图</span>
          </button>
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden`}
            style={{
              width: `${chartWidth}px`,
              height: isMicroStopVisible ? '400px' : '0',
              opacity: isMicroStopVisible ? 1 : 0
            }}
          >
            <div className="h-[400px]">
              <MicroStopStackChart chartWidth={chartWidth} />
            </div>
          </div>
        </div>

        {/* 表格 */}
        <div>
          <button 
            className="flex items-center w-full text-left cursor-pointer mb-2 select-none"
            onClick={() => handleToggle(setIsTableVisible, isTableVisible)}
          >
            {isTableVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span className="ml-1">数据表格</span>
          </button>
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden`}
            style={{
              width: `${chartWidth}px`,
              height: isTableVisible ? '400px' : '0',
              opacity: isTableVisible ? 1 : 0
            }}
          >
            <div className="h-[400px]">
              <Factory4MTable />
            </div>
          </div>
        </div>

        {/* 不良率堆积图 */}
        <div>
          <button 
            className="flex items-center w-full text-left cursor-pointer mb-2 select-none"
            onClick={() => handleToggle(setIsDefectRateVisible, isDefectRateVisible)}
          >
            {isDefectRateVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span className="ml-1">不良率堆积图</span>
          </button>
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden`}
            style={{
              width: `${chartWidth}px`,
              height: isDefectRateVisible ? '400px' : '0',
              opacity: isDefectRateVisible ? 1 : 0
            }}
          >
            <div className="h-[400px]">
              <DefectRateStackChart chartWidth={chartWidth} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}