const STORAGE_KEYS = {
  USER_INFO: 'checkin_user_info',
  CHECKIN_RECORDS: 'checkin_records',
  LAST_CHECKIN_DATE: 'last_checkin_date'
}

export const storage = {
  // 用户信息相关
  getUserInfo() {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(STORAGE_KEYS.USER_INFO)
    return data ? JSON.parse(data) : null
  },

  setUserInfo(userInfo) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
  },

  // 签到记录相关
  getCheckinRecords() {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.CHECKIN_RECORDS)
    return data ? JSON.parse(data) : []
  },

  addCheckinRecord(date) {
    if (typeof window === 'undefined') return
    const records = this.getCheckinRecords()
    if (!records.includes(date)) {
      records.push(date)
      localStorage.setItem(STORAGE_KEYS.CHECKIN_RECORDS, JSON.stringify(records))
    }
  },

  // 最后签到日期
  getLastCheckinDate() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.LAST_CHECKIN_DATE)
  },

  setLastCheckinDate(date) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.LAST_CHECKIN_DATE, date)
  },

  // 检查今天是否已经签到
  hasCheckedInToday() {
    if (typeof window === 'undefined') return false
    const today = new Date().toISOString().split('T')[0]
    const lastCheckin = this.getLastCheckinDate()
    return lastCheckin === today
  },

  // 获取连续签到天数
  getConsecutiveDays() {
    const records = this.getCheckinRecords()
    if (records.length === 0) return 0

    const sortedRecords = records.sort().reverse()
    let consecutive = 1
    const today = new Date()

    for (let i = 1; i < sortedRecords.length; i++) {
      const currentDate = new Date(sortedRecords[i])
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)

      if (currentDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        consecutive++
      } else {
        break
      }
    }

    return consecutive
  },

  // 清除所有数据（调试用）
  clearAll() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    localStorage.removeItem(STORAGE_KEYS.CHECKIN_RECORDS)
    localStorage.removeItem(STORAGE_KEYS.LAST_CHECKIN_DATE)
  }
}