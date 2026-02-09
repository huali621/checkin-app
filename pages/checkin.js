import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { storage } from '../utils/storage'
import { supabaseStorage } from '../utils/supabaseStorage'

export default function Checkin() {
  const [userInfo, setUserInfo] = useState(null)
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [consecutiveDays, setConsecutiveDays] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      // 检查用户是否已填写信息
      const userData = storage.getUserInfo()
      if (!userData || !userData.emergencyEmail) {
        router.push('/')
        return
      }

      setUserInfo(userData)
      
      // 使用邮箱作为唯一标识符，确保用户存在
      try {
        let user = await supabaseStorage.getUserByEmail(userData.emergencyEmail)
        
        if (!user) {
          // 创建新用户
          user = await supabaseStorage.createUser({
            nickname: userData.nickname,
            emergencyEmail: userData.emergencyEmail
          })
        }
        
        // 更新本地存储的用户ID
        storage.setUserInfo({
          nickname: user.nickname,
          emergencyEmail: user.emergency_email,
          userId: user.id
        })
        
        // 获取签到数据
        const checkedIn = await supabaseStorage.hasCheckedInToday(user.id)
        const records = await supabaseStorage.getCheckinRecords(user.id)
        const consecutive = await supabaseStorage.getConsecutiveDays(user.id)
        
        setHasCheckedInToday(checkedIn)
        setTotalDays(records.length)
        setConsecutiveDays(consecutive)
        
      } catch (error) {
        console.error('Error loading data:', error)
        // 网络错误时使用本地数据
        const checkedIn = storage.hasCheckedInToday()
        const consecutive = storage.getConsecutiveDays()
        const total = storage.getCheckinRecords().length
        setHasCheckedInToday(checkedIn)
        setConsecutiveDays(consecutive)
        setTotalDays(total)
      }
    }

    loadUserData()
  }, [router])

  const handleCheckin = async () => {
    if (hasCheckedInToday) {
      alert('今天已经签到过了，明天再来吧！')
      return
    }

    setIsLoading(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      
      // 保存到本地存储
      storage.addCheckinRecord(today)
      storage.setLastCheckinDate(today)
      
      // 同步到云端
      if (userInfo.userId) {
        await supabaseStorage.addCheckinRecord(userInfo.userId, today)
        
        // 从云端获取最新统计
        const consecutive = await supabaseStorage.getConsecutiveDays(userInfo.userId)
        const records = await supabaseStorage.getCheckinRecords(userInfo.userId)
        setConsecutiveDays(consecutive)
        setTotalDays(records.length)
      } else {
        // 使用本地统计
        const consecutive = storage.getConsecutiveDays()
        const total = storage.getCheckinRecords().length
        setConsecutiveDays(consecutive)
        setTotalDays(total)
      }
      
      // 显示成功消息
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
    } catch (error) {
      alert('签到失败，请重试')
      console.error('Error during checkin:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？这将清除您的所有数据。')) {
      storage.clearAll()
      router.push('/')
    }
  }

  if (!userInfo) {
    return <div>加载中...</div>
  }

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  return (
    <div className="container">
      <h1>每日签到打卡</h1>
      
      {showSuccess && (
        <div className="success-message">
          🎉 签到成功！继续保持！
        </div>
      )}
      
      <div className="info-display">
        <p><strong>用户昵称：</strong>{userInfo.nickname}</p>
        <p><strong>紧急联系人：</strong>{userInfo.emergencyEmail}</p>
        <p><strong>今日日期：</strong>{today}</p>
        <p><strong>连续签到：</strong>{consecutiveDays} 天</p>
        <p><strong>总签到天数：</strong>{totalDays} 天</p>
      </div>
      
      <button
        className={`checkin-button ${hasCheckedInToday ? 'completed' : ''}`}
        onClick={handleCheckin}
        disabled={hasCheckedInToday || isLoading}
      >
        {isLoading 
          ? '签到中...' 
          : hasCheckedInToday 
            ? '今日已签到 ✓' 
            : '立即签到'
        }
      </button>
      
      {hasCheckedInToday && (
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          明天再来继续签到吧！
        </p>
      )}
      
      <button 
        onClick={handleLogout}
        style={{ 
          marginTop: '20px', 
          background: '#dc3545',
          fontSize: '14px',
          padding: '10px'
        }}
      >
        退出登录
      </button>
    </div>
  )
}