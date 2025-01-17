import {
  flexRender,
  getCoreRowModel,
  createColumnHelper,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { testData } from '@/lib/mockData/test-data'; // 导入原始数据

type TableRowData = {
  task_text: string;
  task_stop_id: number;
  task_count: number;
  total_task_duration: number;
  productdate: string;
  [key: string]: string | number; // 允许其他动态字段
};

interface DataTableProps {
  groupedData: Record<string, TableRowData[]>;
  dates: string[];
  maxTasks: number;
}

export function Factory4MTable() {
  // 按日期分组并合并"结批"任务
  const groupedData = testData.reduce((acc, item) => {
    const date = item.productdate.split('-').slice(1).join('-'); // 转换为 12-01 格式
    if (!acc[date]) acc[date] = [];

    // 提取任务基础文本（去掉 *数字 部分）
    const baseTaskText = item.task_text.split('*')[0];

    // 如果包含 "结批"，则直接作为结批任务处理
    if (baseTaskText.includes('结批')) {
      const existingTaskIndex = acc[date].findIndex(task => task.task_text.includes('结批'));
      if (existingTaskIndex !== -1) {
        // 如果已有结批任务，统计所有结批任务的数量
        const sameTasks = testData.filter(task => 
          task.productdate.split('-').slice(1).join('-') === date && 
          task.task_text.includes('结批')
        );
        const count = sameTasks.length; // 直接统计总数
        acc[date][existingTaskIndex].task_text = `结批*${count}`;
      } else {
        // 如果没有结批任务，直接添加
        acc[date].push({ ...item, task_text: '结批*1' });
      }
      return acc;
    }

    // 查找是否已有相同任务
    const existingTaskIndex = acc[date].findIndex(task => {
      const taskBaseText = task.task_text.split('*')[0]
      return taskBaseText === baseTaskText && !taskBaseText.includes('结批')
    });
    
    if (existingTaskIndex !== -1) {
      // 如果已有相同任务，统计所有相同任务的数量
      const sameTasks = testData.filter(task => 
        task.productdate.split('-').slice(1).join('-') === date && 
        task.task_text.split('*')[0] === baseTaskText
      );
      const count = sameTasks.length; // 直接统计总数

      // 更新任务文本为 *数字 格式
      acc[date][existingTaskIndex].task_text = `${baseTaskText}*${count}`;
    } else {
      // 如果没有相同任务，直接添加
      acc[date].push(item);
    }
    return acc;
  }, {} as Record<string, typeof testData>);

  // 获取所有日期
  const dates = Object.keys(groupedData);

  // 获取最大任务数
  const maxTasks = Math.max(...Object.values(groupedData).map((tasks) => tasks.length));

  // 定义列
  const columnHelper = createColumnHelper<TableRowData>();
  const columns = dates.map((date) =>
    columnHelper.accessor((row) => row[date], {
      header: date,
      cell: (info) => {
        const taskText = info.getValue();
        let displayText = taskText;

        if (typeof taskText === 'string') {
          if (taskText.includes('*')) {
            const [taskName, count] = taskText.split('*');
            displayText = taskName.length > 4 ? `${taskName.slice(0, 4)}...*${count}` : `${taskName}*${count}`;
          } else if (taskText.length > 4) {
            displayText = `${taskText.slice(0, 4)}...`;
          }
        }

        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="whitespace-nowrap overflow-hidden text-ellipsis w-[80px] cursor-pointer" style={{ minWidth: '80px', maxWidth: '80px' }}>
                  {displayText}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-opacity-90 bg-gray-800 text-white">
                <p>{taskText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    })
  );

  // 转换数据格式
  const tableData = Array.from({ length: maxTasks }).map((_, index) => {
    const row: TableRowData = {
      task_text: '',
      task_stop_id: 0,
      task_count: 0,
      total_task_duration: 0,
      productdate: '',
    };
    dates.forEach((date) => {
      const task = groupedData[date][index];
      row[date] = task ? task.task_text : '';
    });
    return row;
  });

  // 创建表格实例
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div 
      style={{ 
        width: `${dates.length * 96}px`, 
        marginLeft: '63px',
        overflow: 'hidden' // 隐藏滚动条
      }}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead 
                  key={header.id} 
                  className="text-center"
                  style={{ width: '80px' }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell 
                  key={cell.id} 
                  className="text-center"
                  style={{ width: '80px' }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}