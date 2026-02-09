// 验证数据库表结构
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verifySchema() {
  try {
    console.log('🔍 验证数据库表结构...')
    
    // 检查 users 表
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.error('❌ users 表验证失败:', usersError.message)
    } else {
      console.log('✅ users 表已就绪')
    }
    
    // 检查 checkin_records 表
    const { data: checkinData, error: checkinError } = await supabase
      .from('checkin_records')
      .select('*')
      .limit(1)
    
    if (checkinError) {
      console.error('❌ checkin_records 表验证失败:', checkinError.message)
    } else {
      console.log('✅ checkin_records 表已就绪')
    }
    
    console.log('🎉 数据库验证完成！')
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message)
  }
}

verifySchema()