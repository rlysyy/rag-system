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
      <div className="space-y-4">   
        {/* 小停机堆积图 */}
        <Collapsible open={isMicroStopOpen} onOpenChange={setIsMicroStopOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center w-full text-left cursor-pointer mb-2 select-none">
              {isMicroStopOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              <span className="ml-1">小停机堆积图</span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <MicroStopStack />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 表格 */}
        <Collapsible open={isTableOpen} onOpenChange={setIsTableOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center w-full text-left cursor-pointer mb-2 select-none">
              {isTableOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              <span className="ml-1">数据表格</span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Factory4MTable />
          </CollapsibleContent>
        </Collapsible>

        {/* 不良率堆积图 */}
        <Collapsible open={isDefectRateOpen} onOpenChange={setIsDefectRateOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center w-full text-left cursor-pointer mb-2 select-none">
              {isDefectRateOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              <span className="ml-1">不良率堆积图</span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <DefectRateStackChart />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}