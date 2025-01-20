import * as React from "react"
import { X } from "lucide-react"

type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "选择...",
  className,
}: MultiSelectProps) {
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (!value.includes(selectedValue)) {
      onChange([...value, selectedValue]);
    }
    // 重置 select 的值
    event.target.value = "";
  };

  return (
    <div className={className}>
      {/* 已选择的标签 */}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((item) => (
          <span 
            key={item} 
            className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1"
          >
            {item}
            <button
              onClick={() => onChange(value.filter(v => v !== item))}
              className="hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {/* 原生下拉选择框 */}
      <select
        onChange={handleSelectChange}
        className="w-full p-2 border rounded-md"
        value=""
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={value.includes(option.value)}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
} 