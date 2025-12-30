import { NextResponse } from 'next/server'

/**
 * API 路由：获取筛选条件
 * 注意：此路由主要用于服务端处理，实际筛选条件获取应在客户端通过 bitable API 完成
 */
export async function GET() {
  return NextResponse.json({
    message: '筛选条件获取应在客户端通过 bitable API 完成',
    note: '请使用 FilterMonitor 组件在客户端获取筛选条件'
  })
}

