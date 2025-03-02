import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { maintenanceColors, maintenanceLegends } from "@/lib/constants/colors";
import { MaintenanceTableProps } from '@/types/data';
import { useState, useEffect } from "react";

export function MaintenanceTable({ data, unitIds }: MaintenanceTableProps) {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [activeUnitId, setActiveUnitId] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // 检测是否为触摸设备
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // 生成完整的日期范围（从12-01到12-31）
  const generateDates = () => {
    const dates = [];
    for (let day = 1; day <= 31; day++) {
      dates.push(`12-${day.toString().padStart(2, '0')}`);
    }
    return dates;
  };

  const allDates = generateDates();

  // 按日期和UnitID分组数据
  const groupedData = data.reduce((acc, item) => {
    const [_, month, day] = item.the_date.split('-');
    const formattedDate = `${month}-${day}`;
    if (!acc[formattedDate]) {
      acc[formattedDate] = {};
    }
    if (!acc[formattedDate][item.UnitID]) {
      acc[formattedDate][item.UnitID] = [];
    }
    acc[formattedDate][item.UnitID].push(item);
    return acc;
  }, {} as Record<string, Record<number, typeof data>>);

  // 获取单元格背景色
  const getCellColor = (remarks: string) => {
    switch (remarks) {
      case '高等级报警':
        return maintenanceColors.highAlert;
      case '低等级报警':
        return maintenanceColors.lowAlert;
      case '修正值':
        return maintenanceColors.correction;
      default:
        return '';
    }
  };

  // Unit名称映射
  const unitNames: Record<number, string> = {
    1: 'IBM Index ESC',
    2: 'IBM 中间搬送 ESC',
    3: 'IBM 脱磁器 吸头',
    4: '铁芯铆接线圈 ESC',
    5: '铁芯铆接ESC部'
  };

  const handleMouseMove = (e: React.MouseEvent, unitId: number) => {
    if (isTouchDevice) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setTooltipPosition({ x, y: 0 });
    setActiveUnitId(unitId);
  };

  const handleRowClick = (e: React.MouseEvent | React.TouchEvent, unitId: number) => {
    if (!isTouchDevice) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    setTooltipPosition({ x, y: 0 });
    
    if (activeUnitId === unitId) {
      setShowTooltip(!showTooltip);
    } else {
      setActiveUnitId(unitId);
      setShowTooltip(true);
    }
  };

  useEffect(() => {
    if (!isTouchDevice) return;

    const handleClickOutside = (e: TouchEvent | MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('tr')) {
        setShowTooltip(false);
        setActiveUnitId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isTouchDevice]);

  return (
    <>
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-blue-500 rounded"></div>
        <div className="text-lg font-medium dark:text-gray-200">
          气缸电磁阀
        </div>
      </div>

      {/* 表格 */}
      <div className="text-xs relative">
        <div className="rounded-md border dark:border-gray-800">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                {allDates.map((date) => (
                  <TableCell 
                    key={date}
                    className="text-center font-medium p-2 
                      bg-gray-100/80 dark:bg-gray-800 
                      text-muted-foreground dark:text-gray-300"
                    style={{ width: '80px', height: '40px' }}
                  >
                    {date}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {unitIds.map((unitId) => (
                <TableRow 
                  key={unitId} 
                  className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/50 ${isTouchDevice ? 'cursor-pointer' : ''}`}
                  onMouseEnter={() => !isTouchDevice && setShowTooltip(true)}
                  onMouseLeave={() => !isTouchDevice && setShowTooltip(false)}
                  onMouseMove={(e) => handleMouseMove(e, unitId)}
                  onClick={(e) => handleRowClick(e, unitId)}
                >
                  {allDates.map((date) => (
                    <TableCell
                      key={`${unitId}-${date}`}
                      className="text-center p-0 bg-white dark:bg-gray-800/30"
                      style={{ width: '80px', height: '30px' }}
                    >
                      {groupedData[date]?.[unitId]?.map((item, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] p-1 h-full dark:text-white"
                          style={{ backgroundColor: getCellColor(item.remarks) }}
                        >
                          {item.remarks}
                        </div>
                      ))}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Tooltip */}
        {showTooltip && activeUnitId !== null && (
          <div 
            className="absolute z-[100] pointer-events-none bg-gray-800 text-white px-2 py-1 rounded text-xs"
            style={{
              top: '0',
              left: `${tooltipPosition.x}px`,
              transform: 'translate(-50%, -100%) translateY(-4px)'
            }}
          >
            {unitNames[activeUnitId]}
            <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800" />
          </div>
        )}
      </div>
    </>
  );
} 