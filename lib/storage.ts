export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value)
    localStorage.setItem(key, valueToStore)
  }
} 