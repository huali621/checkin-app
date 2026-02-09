import { supabase } from './supabase'
import { storage as localStorage } from './storage'

class SupabaseStorage {
  // 用户相关操作
  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          nickname: userData.nickname,
          emergency_email: userData.emergencyEmail
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('emergency_email', email)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error getting user:', error)
      throw error
    }
  }

  // 签到记录相关操作
  async addCheckinRecord(userId, date) {
    try {
      const { data, error } = await supabase
        .from('checkin_records')
        .insert([{
          user_id: userId,
          checkin_date: date
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding checkin record:', error)
      throw error
    }
  }

  async getCheckinRecords(userId) {
    try {
      const { data, error } = await supabase
        .from('checkin_records')
        .select('checkin_date')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false })

      if (error) throw error
      return data.map(record => record.checkin_date)
    } catch (error) {
      console.error('Error getting checkin records:', error)
      throw error
    }
  }

  async hasCheckedInToday(userId) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('checkin_records')
        .select('id')
        .eq('user_id', userId)
        .eq('checkin_date', today)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      console.error('Error checking today checkin:', error)
      throw error
    }
  }

  // 获取连续签到天数
  async getConsecutiveDays(userId) {
    try {
      const records = await this.getCheckinRecords(userId)
      if (records.length === 0) return 0

      let consecutive = 1
      const today = new Date()

      for (let i = 1; i < records.length; i++) {
        const currentDate = new Date(records[i])
        const expectedDate = new Date(today)
        expectedDate.setDate(expectedDate.getDate() - i)

        if (currentDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
          consecutive++
        } else {
          break
        }
      }

      return consecutive
    } catch (error) {
      console.error('Error calculating consecutive days:', error)
      return 0
    }
  }

  // 同步本地数据到云端
  async syncLocalDataToCloud(userData) {
    try {
      // 检查用户是否已存在
      let user = await this.getUserByEmail(userData.emergencyEmail)
      
      if (!user) {
        // 创建新用户
        user = await this.createUser(userData)
      }

      // 同步签到记录
      const localRecords = localStorage.getCheckinRecords()
      for (const date of localRecords) {
        try {
          await this.addCheckinRecord(user.id, date)
        } catch (error) {
          // 忽略重复记录的错误
          if (!error.message.includes('duplicate')) {
            throw error
          }
        }
      }

      return user
    } catch (error) {
      console.error('Error syncing local data:', error)
      throw error
    }
  }
}

export const supabaseStorage = new SupabaseStorage()