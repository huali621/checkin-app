# 签到打卡应用

一个简洁的每日签到打卡应用，支持本地存储用户信息，具有连续签到统计功能。

## 功能特点

- ✅ 用户信息填写（昵称 + 紧急联系人邮箱）
- ✅ 每日签到打卡
- ✅ 连续签到天数统计
- ✅ 本地数据存储
- ✅ 响应式设计
- ✅ Vercel 一键部署

## 技术栈

- Next.js 15
- React 19
- 本地存储 (localStorage)
- CSS3 动画和渐变

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## Supabase 配置

1. 访问 [Supabase](https://supabase.com) 创建项目
2. 复制 `.env.local.example` 为 `.env.local`
3. 填入你的 Supabase 项目配置：
   ```
   NEXT_PUBLIC_SUPABASE_URL=你的项目URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名密钥
   ```
4. 在 Supabase SQL 编辑器中运行 `supabase/schema.sql` 创建表结构

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 上导入项目
3. 添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 点击部署即可

## 使用说明

1. 首次使用需要填写昵称和紧急联系人邮箱
2. 每天只能签到一次
3. 签到记录保存在浏览器本地存储中
4. 支持查看连续签到天数和总签到天数

## 数据说明

- 所有数据都存储在浏览器的 localStorage 中
- 清除浏览器数据会导致签到记录丢失
- 后续版本将支持数据库存储