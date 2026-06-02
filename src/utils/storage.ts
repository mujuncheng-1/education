export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) {
        return fallback
      }
      return JSON.parse(raw) as T
    } catch (error) {
      console.error('[storage.get] 数据解析失败', error)
      return fallback
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('[storage.set] 数据写入失败', error)
    }
  },
  remove(key: string): void {
    localStorage.removeItem(key)
  },
}
