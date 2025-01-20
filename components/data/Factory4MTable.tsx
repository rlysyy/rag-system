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
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FilterIcon, Filter } from "lucide-react";
import { testData } from '@/lib/mockData/test-data';
import { Input } from "@/components/ui/input";
import { colorLegends, getTaskBackgroundColor } from '@/lib/constants/colors';

interface TaskData {
  text: string;
  task_stop_id: number;
}

// 使用导入的函数替换原有的 getBackgroundColor
const getBackgroundColor = getTaskBackgroundColor;

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
      const row: { [key: string]: TaskData | '' } = {};
      dates.forEach((date) => {
        const tasks = groupedData[date] || [];
        const task = tasks[index];
        if (task) {
          const count = task.task_count > 1 ? `*${task.task_count}` : '';
          row[date] = {
            text: `${task.task_text}${count}`,
            task_stop_id: task.task_stop_id
          };
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
    if (!selectedFilters.length) return tableData;

    return tableData.map(row => {
      const newRow = { ...row };
      
      // 遍历每个日期
      dates.forEach(date => {
        const cellValue = row[date];
        
        // 如果单元格有值且不是字符串（是我们的TaskData对象）
        if (cellValue && typeof cellValue !== 'string') {
          const taskName = cellValue.text.split('*')[0];
          
          // 检查是否匹配任何选中的筛选条件
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
        } else {
          newRow[date] = '';
        }
      });
      
      return newRow;
    });
  }, [tableData, selectedFilters, dates]);

  // 添加一个函数检查行是否为空
  const isEmptyRow = (row: any) => {
    return dates.every(date => !row[date] || row[date] === '');
  };

  // 在渲染表格时过滤掉空行
  const visibleData = useMemo(() => {
    return filteredData.filter(row => !isEmptyRow(row));
  }, [filteredData, dates]);

  // 添加聚焦事件处理函数
  function handleDropdownOpen() {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  }

  function handleFilterChange(option: string) {
    setSelectedFilters(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  }

  if (!mounted) {
    return null; // 或者返回一个加载占位符
  }

  return (
    <>
      <div className="ml-[60px] mb-2 flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu onOpenChange={(open) => {
          if (open) {
            handleDropdownOpen();
          }
        }}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="h-8"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <FilterIcon className="mr-2 h-4 w-4" />
              筛选
              {selectedFilters.length > 0 && (
                <span className="ml-1">({selectedFilters.length})</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-[350px]"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              zIndex: 1000,
              position: 'absolute',
              top: '100%',
              marginTop: '4px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            <div 
              className="px-2 py-2" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{ position: 'relative' }}
            >
              <Input
                ref={searchInputRef}
                placeholder="搜索..."
                value={searchQuery}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearchQuery(e.target.value);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Tab') {
                    e.stopPropagation();
                    e.preventDefault();
                  }
                }}
                className="w-full"
              />
            </div>
            {filteredOptions.slice(0, 10).map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={selectedFilters.includes(option)}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => handleFilterChange(option)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFilterChange(option);
                }}
              >
                {option}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex items-center gap-3 text-xs">
          {colorLegends.map(legend => (
            <div key={legend.id} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: legend.color }}
              />
              <span>{legend.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs ml-[60px]">
        <div 
          className="min-h-[800px] overflow-visible"
          style={{
            width: `${dates.length * 96}px`,
            maxWidth: `${dates.length * 96}px`
          }}
        >
          <div className="w-full overflow-visible">
            <Table className="w-full border-collapse table-fixed relative">
              <colgroup>
                {dates.map((date) => (
                  <col key={date} style={{ width: '80px' }} />
                ))}
              </colgroup>
              <TableHeader>
                <TableRow>
                  {dates.map((date) => (
                    <TableHead 
                      key={date} 
                      className="text-center overflow-visible box-border h-10 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                      style={{ 
                        width: '80px',
                        padding: '8px'
                      }}
                    >
                      {date.slice(5).replace('-', '-')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {dates.map((date) => (
                      <TableCell 
                        key={date} 
                        className="text-center overflow-visible group relative box-border align-middle"
                        style={{ 
                          width: '80px',
                          padding: '8px',
                          backgroundColor: row[date] && typeof row[date] !== 'string' 
                            ? getBackgroundColor(row[date].task_stop_id) 
                            : 'transparent'
                        }}
                      >
                        <div className="relative group/tooltip">
                          <span>
                            {row[date] && typeof row[date] !== 'string' ? (() => {
                              const text = row[date].text;
                              const [taskName, count] = text.split('*');
                              const displayText = taskName.length > 4 ? `${taskName.slice(0, 4)}...` : taskName;
                              return count ? `${displayText}*${count}` : displayText;
                            })() : null}
                          </span>
                          {row[date] && typeof row[date] !== 'string' && row[date].text.length > 4 && (
                            <div className="absolute hidden group-hover/tooltip:block z-[100]"
                                 style={{
                                   backgroundColor: 'rgb(31, 41, 55)',
                                   color: 'white',
                                   padding: '4px 8px',
                                   borderRadius: '4px',
                                   fontSize: '12px',
                                   whiteSpace: 'nowrap',
                                   bottom: '100%',
                                   marginBottom: '4px',
                                   ...(dates.indexOf(date) === 0 
                                     ? { left: '0' }
                                     : dates.indexOf(date) === dates.length - 1
                                     ? { right: '0' }
                                     : { left: '50%', transform: 'translateX(-50%)' }
                                   )
                                 }}
                            >
                              {row[date].text}
                              <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}