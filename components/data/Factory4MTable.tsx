'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { FilterIcon } from "lucide-react";
import { testData } from '@/lib/mockData/test-data';
import { Input } from "@/components/ui/input";
import { useState as useStateImport } from "react";

export function Factory4MTable() {
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 按日期分组数据并合并结批任务
  const { groupedData, dates } = useMemo(() => {
    const grouped: Record<string, typeof testData> = {};
    const dateSet = new Set<string>();

    testData.forEach(item => {
      const date = item.productdate;
      dateSet.add(date);
      if (!grouped[date]) {
        grouped[date] = [];
      }

      // 合并结批任务
      if (item.task_text.includes('结批')) {
        const existingBatchItem = grouped[date].find(x => x.task_text.includes('结批'));
        if (existingBatchItem) {
          existingBatchItem.task_count += item.task_count;
          return; // 重要：如果合并了就不要继续添加
        }
        // 如果是第一个结批任务，将文本统一为"结批"
        item = { ...item, task_text: '结批' };
      }
      
      grouped[date].push(item);
    });

    return {
      groupedData: grouped,
      dates: Array.from(dateSet).sort()
    };
  }, []);

  // 生成表格数据时保持计数显示
  const tableData = useMemo(() => {
    if (!groupedData || Object.keys(groupedData).length === 0) return [];
    const maxTasks = Math.max(...Object.values(groupedData).map(tasks => tasks.length));
    
    return Array.from({ length: maxTasks }).map((_, index) => {
      const row: { [key: string]: string } = {};
      dates.forEach((date) => {
        const tasks = groupedData[date] || [];
        const task = tasks[index];
        if (task) {
          const count = task.task_count > 1 ? `*${task.task_count}` : '';
          row[date] = `${task.task_text}${count}`;
        } else {
          row[date] = '';
        }
      });
      return row;
    });
  }, [dates, groupedData]);

  // 筛选选项
  const filterOptions = useMemo(() => 
    Array.from(new Set(
      Object.values(groupedData)
        .flat()
        .map(item => {
          if (item.task_text.includes('结批')) {
            return '结批';
          }
          return item.task_text;
        })
        .filter(Boolean)
    )).sort(),
    [groupedData]
  );

  // 过滤选项
  const filteredOptions = useMemo(() => 
    filterOptions.filter(option => 
      option.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [filterOptions, searchQuery]
  );

  // 筛选数据 - 使用 useMemo 优化性能
  const filteredData = useMemo(() => {
    if (selectedFilters.length === 0) return tableData;
    
    return tableData.map(record => {
      const newRow: { [key: string]: string } = {};
      
      dates.forEach(date => {
        const cellValue = record[date];
        if (cellValue) {
          const taskName = cellValue.split('*')[0];
          if (selectedFilters.some(filter => {
            if (filter === '结批') {
              return taskName.includes('结批');
            }
            return taskName === filter;
          })) {
            newRow[date] = cellValue;
          } else {
            newRow[date] = '';
          }
        }
      });
      
      return newRow;
    }).filter(row => 
      Object.values(row).some(value => value.length > 0)
    );
  }, [tableData, selectedFilters, dates]);

  function handleDropdownOpen() {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  }

  if (!mounted) {
    return null; // 或者返回一个加载占位符
  }

  return (
    <>
      <div className="ml-[60px] mb-2">
        <DropdownMenu onOpenChange={(open) => {
          if (open) handleDropdownOpen();
        }}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FilterIcon className="mr-2 h-4 w-4" />
              筛选 {selectedFilters.length > 0 && `(${selectedFilters.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <div className="p-2">
              <Input
                ref={searchInputRef}
                placeholder="搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-[300px] overflow-auto">
              {filteredOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  checked={selectedFilters.includes(option)}
                  onCheckedChange={(checked) => {
                    setSelectedFilters(prev =>
                      checked
                        ? [...prev, option]
                        : prev.filter(item => item !== option)
                    );
                  }}
                  onFocus={(e) => e.preventDefault()}
                  onMouseEnter={(e) => e.preventDefault()}
                >
                  {option}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-xs ml-[60px]">
        <div className="min-h-[800px] overflow-visible">
          <Table className="overflow-visible">
            <TableHeader>
              <TableRow className="overflow-visible">
                {dates.map((date) => (
                  <TableHead 
                    key={date} 
                    className="text-center overflow-visible"
                    style={{ width: '80px', minWidth: '80px' }}
                  >
                    {date.slice(5).replace('-', '-')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-visible">
              {filteredData.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="overflow-visible">
                  {dates.map((date) => (
                    <TableCell 
                      key={date} 
                      className="text-center overflow-visible group relative"
                      style={{ width: '80px', minWidth: '80px' }}
                    >
                      {row[date] ? (() => {
                        const [taskName, count] = row[date].split('*');
                        const displayText = taskName.length > 4 ? `${taskName.slice(0, 4)}...` : taskName;
                        const fullText = count ? `${taskName}*${count}` : taskName;
                        
                        return (
                          <div className="relative">
                            <span>{count ? `${displayText}*${count}` : displayText}</span>
                            {/* 悬停提示 */}
                            {taskName.length > 4 && (
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block 
                                            bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
                                {fullText}
                              </div>
                            )}
                          </div>
                        );
                      })() : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}