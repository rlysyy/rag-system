import { TestDataMaintenance } from '@/types/data'
import { testDataDefectRate, dailyDefectRates } from '@/lib/mockData/test-data-defectRate'
import { testDataMicroStops } from '@/lib/mockData/test-data-microStops'
import { testData } from '@/lib/mockData/test-data'

export const dataApi = {
  getDefectRateData: async () => {
    // 模拟 API 调用
    return {
      defectRates: testDataDefectRate,
      dailyRates: dailyDefectRates
    }
  },

  getMicroStopsData: async () => {
    return testDataMicroStops
  },

  getMaintenanceData: async () => {
    // 模拟维护数据
    const data: TestDataMaintenance[] = [
      // ... 实际数据
    ]
    return data
  },

  get4MData: async () => {
    return testData
  }
} 