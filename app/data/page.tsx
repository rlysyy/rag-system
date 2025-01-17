'use client'

import { Factory4MTable } from '@/components/data/Factory4MTable'
import { testData } from '../../lib/mockData/test-data';
import MicroStopStack from '@/components/data/MicroStopStack';
import DefectRateStackChart from '@/components/data/DefectRateStackChart';
import { useState } from 'react';
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
  const chartWidth = dates.length * 96 + 65;

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="min-w-[400px]">   
        {/* 小停机堆积图 */}
        <div className="mb-4">
          <button 
            className="flex items-center w-full text-left cursor-pointer mb-2 select-none"
            onClick={() => setIsMicroStopVisible(!isMicroStopVisible)}
            type="button"
          >
            {isMicroStopVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span className="ml-1">小停机堆积图</span>
          </button>
          <div className={`transition-all duration-300 ${isMicroStopVisible ? 'h-[400px] opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}
               style={{ width: `${chartWidth}px` }}>
            <MicroStopStack />
          </div>
        </div>

        {/* 表格 */}
        <div className="mb-4">
          <button 
            className="flex items-center w-full text-left cursor-pointer mb-2 select-none"
            onClick={() => setIsTableVisible(!isTableVisible)}
            type="button"
          >
            {isTableVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span className="ml-1">数据表格</span>
          </button>
          <div className={`transition-all duration-300 ${isTableVisible ? 'h-[400px] opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}
               style={{ width: `${chartWidth}px` }}>
            <Factory4MTable />
          </div>
        </div>

        {/* 不良率堆积图 */}
        <div className="mb-4">
          <button 
            className="flex items-center w-full text-left cursor-pointer mb-2 select-none"
            onClick={() => setIsDefectRateVisible(!isDefectRateVisible)}
            type="button"
          >
            {isDefectRateVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span className="ml-1">不良率堆积图</span>
          </button>
          <div className={`transition-all duration-300 ${isDefectRateVisible ? 'h-[400px] opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}
               style={{ width: `${chartWidth}px` }}>
            <DefectRateStackChart />
          </div>
        </div>
      </div>
    </div>
  );
}