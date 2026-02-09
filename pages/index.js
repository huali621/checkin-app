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
    // 简化检查：只要有邮箱就跳转到签到页
    const userInfo = storage.getUserInfo()
    if (userInfo && userInfo.emergencyEmail) {
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
      // 先检查用户是否已存在
      let user = await supabaseStorage.getUserByEmail(emergencyEmail.trim())
      
      if (!user) {
        // 创建新用户
        user = await supabaseStorage.createUser({
          nickname: nickname.trim(),
          emergencyEmail: emergencyEmail.trim()
        })
      }

      // 保存用户信息到本地存储
      storage.setUserInfo({
        nickname: nickname.trim(),
        emergencyEmail: emergencyEmail.trim(),
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