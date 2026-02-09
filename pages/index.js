import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { storage } from '../utils/storage'
import { supabaseStorage } from '../utils/supabaseStorage'

export default function UserInfo() {
  const [nickname, setNickname] = useState('')
  const [emergencyEmail, setEmergencyEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 如果用户已经填写过信息，直接跳转到签到页面
    const userInfo = storage.getUserInfo()
    if (userInfo) {
      router.push('/checkin')
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!nickname.trim()) {
      alert('请输入昵称')
      return
    }

    if (!emergencyEmail.trim()) {
      alert('请输入紧急联系人邮箱')
      return
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emergencyEmail)) {
      alert('请输入有效的邮箱地址')
      return
    }

    setIsLoading(true)

    try {
      // 保存到本地存储（作为备份）
      storage.setUserInfo({
        nickname: nickname.trim(),
        emergencyEmail: emergencyEmail.trim(),
        createdAt: new Date().toISOString()
      })

      // 同步到 Supabase 云端
      const user = await supabaseStorage.createUser({
        nickname: nickname.trim(),
        emergencyEmail: emergencyEmail.trim()
      })

      // 保存用户ID到本地存储
      storage.setUserInfo({
        ...storage.getUserInfo(),
        userId: user.id
      })

      // 跳转到签到页面
      router.push('/checkin')
    } catch (error) {
      alert('保存信息失败，请重试')
      console.error('Error saving user info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>欢迎使用签到打卡</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nickname">昵称</label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="请输入您的昵称"
            maxLength={20}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="emergencyEmail">紧急联系人邮箱</label>
          <input
            type="email"
            id="emergencyEmail"
            value={emergencyEmail}
            onChange={(e) => setEmergencyEmail(e.target.value)}
            placeholder="请输入紧急联系人邮箱"
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? '保存中...' : '开始签到'}
        </button>
      </form>
    </div>
  )
}