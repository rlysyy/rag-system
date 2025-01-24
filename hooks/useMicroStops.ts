import { useState, useEffect, useCallback } from 'react'
import { ChartDataItem } from '@/types/data'
import { testDataMicroStops } from '@/lib/mockData/test-data-microStops'

export function useMicroStops() {
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [errorTypes, setErrorTypes] = useState<string[]>([])
  const [hiddenBars, setHiddenBars] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const groupedData = testDataMicroStops.reduce((acc: Record<string, ChartDataItem>, curr) => {
      const date = curr.dttime.split('-').slice(1).join('-')
      if (!acc[date]) {
        acc[date] = { date }
      }
      acc[date][curr.errid] = (Number(acc[date][curr.errid]) || 0) + curr.total_errcount
      return acc
    }, {})

    setChartData(Object.values(groupedData))
    
    const types = [...new Set(testDataMicroStops.map(item => item.errid))]
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