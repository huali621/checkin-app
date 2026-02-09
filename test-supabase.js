// 测试 Supabase 连接的脚本
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// 从环境变量读取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 请先在 .env.local 文件中配置 Supabase 信息')
  console.error('当前配置:', { supabaseUrl: supabaseUrl ? '已设置' : '未设置', supabaseAnonKey: supabaseAnonKey ? '已设置' : '未设置' })
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('🔄 测试 Supabase 连接...')
    console.log('URL:', supabaseUrl)
    
    // 测试查询用户表
    const { data, error } = await supabase.from('users').select('*').limit(1)
    
    if (error) {
      console.error('❌ 连接失败:', error.message)
      console.error('错误详情:', error)
      return false
    }
    
    console.log('✅ Supabase 连接成功！')
    console.log('📊 数据库表已就绪')
    console.log('测试数据:', data)
    return true
    
  } catch (error) {
    console.error('❌ 连接错误:', error.message)
    return false
  }
}

testConnection()