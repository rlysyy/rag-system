import { useState, useEffect, useCallback } from 'react'
import { ChartDataItem } from '@/types/data'
import { testDataDefectRate, dailyDefectRates } from '@/lib/mockData/test-data-defectRate'

export function useDefectRate() {
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [errorTypes, setErrorTypes] = useState<string[]>([])
  const [hiddenBars, setHiddenBars] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const groupedData = testDataDefectRate.reduce((acc: Record<string, ChartDataItem>, curr) => {
      const date = curr.dttime.split('-').slice(1).join('-')
      if (!acc[date]) {
        acc[date] = { 
          date,
          total_defect_rate: dailyDefectRates[curr.dttime] || 0
        }
      }
      acc[date][curr.ngid] = (Number(acc[date][curr.ngid]) || 0) + curr.count
      return acc
    }, {})

    setChartData(Object.values(groupedData))
    
    const types = [...new Set(testDataDefectRate.map(item => item.ngid))]
    setErrorTypes(types)
    
    const initialHiddenBars: Record<string, boolean> = {}
    types.forEach(type => {
      initialHiddenBars[type] = false
    })
    setHiddenBars(initialHiddenBars)
  }, [])

  const handleLegendClick = useCallback((dataKey: string) => {
    if (dataKey === 'all') {
      const newHiddenBars: Record<string, boolean> = {}
      const shouldShow = errorTypes.some(type => hiddenBars[type])
      errorTypes.forEach(type => {
        newHiddenBars[type] = !shouldShow
      })
      setHiddenBars(newHiddenBars)
    } else {
      setHiddenBars(prev => ({
        ...prev,
        [dataKey]: !prev[dataKey]
      }))
    }
  }, [errorTypes, hiddenBars])

  return {
    chartData,
    errorTypes,
    hiddenBars,
    handleLegendClick
  }
} 