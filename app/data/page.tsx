'use client'

import { Factory4MTable } from '@/components/data/Factory4MTable'
import MicroStopStack from '@/components/data/MicroStopStack';
import DefectRateStackChart from '@/components/data/DefectRateStackChart';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function DataPage() {
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [isMicroStopOpen, setIsMicroStopOpen] = useState(true);
  const [isDefectRateOpen, setIsDefectRateOpen] = useState(true);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="min-w-[1800px]">
        {/* 小停机堆积图 */}
        <section>
          <button 
            className="flex items-center w-full text-left cursor-pointer mb-2 select-none"
            onClick={() => setIsMicroStopOpen(!isMicroStopOpen)}
            type="button"
          >
            {isMicroStopOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span className="ml-1">小停机堆积图</span>
          </button>
          <div className={`${isMicroStopOpen ? 'block' : 'hidden'}`}>
            <MicroStopStack />
          </div>
        </section>

        {/* 表格 */}
        <section>
          <button 
            className="flex items-center w-full text-left cursor-pointer mb-2 select-none"
            onClick={() => setIsTableOpen(!isTableOpen)}
            type="button"
          >
            {isTableOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span className="ml-1">数据表格</span>
          </button>
          <div className={`${isTableOpen ? 'block' : 'hidden'}`}>
            <Factory4MTable />
          </div>
        </section>

        {/* 不良率堆积图 */}
        <section>
          <button 
            className="flex items-center w-full text-left cursor-pointer mb-2 select-none"
            onClick={() => setIsDefectRateOpen(!isDefectRateOpen)}
            type="button"
          >
            {isDefectRateOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span className="ml-1">不良率堆积图</span>
          </button>
          <div className={`${isDefectRateOpen ? 'block' : 'hidden'}`}>
            <DefectRateStackChart />
          </div>
        </section>
      </div>
    </div>
  );
}