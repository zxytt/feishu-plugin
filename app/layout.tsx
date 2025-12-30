import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '飞书文档筛选条件插件',
  description: '获取飞书文档的筛选条件',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

