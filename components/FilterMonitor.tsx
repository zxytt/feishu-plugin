'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

interface FilterCondition {
  fieldId: string
  fieldName: string
  operator: string
  value: any
}

interface FilterInfo {
  viewId: string
  viewName: string
  conditions: FilterCondition[]
}

export default function FilterMonitor() {
  const [filterInfo, setFilterInfo] = useState<FilterInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取筛选条件
  const getFilterInfo = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 [调试] 开始获取筛选条件...')

      // 检查是否在飞书环境中
      if (typeof window === 'undefined' || !(window as any).bitable) {
        console.error('❌ [调试] 不在飞书环境中，window.bitable 不存在')
        throw new Error('请在飞书文档环境中使用此插件')
      }

      console.log('✅ [调试] 飞书环境检查通过')
      const bitable = (window as any).bitable
      
      // 获取当前表格实例
      console.log('📊 [调试] 获取 base...')
      const base = await bitable.base.getActiveBase()
      console.log('✅ [调试] Base 获取成功:', base)
      
      console.log('📊 [调试] 获取 table...')
      const table = await base.getActiveTable()
      console.log('✅ [调试] Table 获取成功:', table)
      
      console.log('📊 [调试] 获取 view...')
      const view = await table.getActiveView()
      console.log('✅ [调试] View 获取成功:', view)

      // 获取视图的筛选信息
      console.log('📊 [调试] 获取筛选信息...')
      const filterInfo = await view.getFilterInfo()
      console.log('✅ [调试] 筛选信息获取成功:', filterInfo)
      
      // 解析筛选条件
      const conditions: FilterCondition[] = []
      
      if (filterInfo && filterInfo.conditions) {
        for (const condition of filterInfo.conditions) {
          const field = await table.getFieldById(condition.field_id)
          const fieldName = field.name
          
          conditions.push({
            fieldId: condition.field_id,
            fieldName: fieldName,
            operator: condition.operator || 'unknown',
            value: condition.value || condition.values || []
          })
        }
      }

      setFilterInfo({
        viewId: view.id,
        viewName: view.name,
        conditions
      })
      
      console.log('✅ [调试] 筛选条件处理完成，共', conditions.length, '条条件')
    } catch (err: any) {
      console.error('❌ [调试] 获取筛选条件失败:', err)
      console.error('❌ [调试] 错误堆栈:', err.stack)
      setError(err.message || '获取筛选条件失败，请确保在飞书文档环境中使用')
    } finally {
      setLoading(false)
      console.log('🔍 [调试] 获取筛选条件流程结束')
    }
  }

  /**
   * 自动监听筛选条件变化的实现
   * 
   * 采用双重监听机制确保及时捕获筛选条件变化：
   * 
   * 1. 事件监听（Event-based）- 主要方式
   *    - 使用 bitable.base.onSelectionChange() 监听视图选择变化
   *    - 当用户切换视图或修改筛选条件时，会触发此事件
   *    - 优点：实时响应，性能好
   *    - 缺点：依赖飞书 API 的事件支持
   * 
   * 2. 轮询检查（Polling）- 备用方案
   *    - 使用 setInterval 每 3 秒检查一次筛选条件
   *    - 作为事件监听的补充，确保不会遗漏变化
   *    - 优点：可靠性高，不依赖事件
   *    - 缺点：有延迟，消耗一定资源
   */
  useEffect(() => {
    // 组件挂载时立即获取一次筛选条件
    getFilterInfo()

    // 检查是否在飞书环境中
    if (typeof window === 'undefined' || !(window as any).bitable) {
      return
    }

    const bitable = (window as any).bitable
    
    // ========== 方式一：事件监听（主要方式） ==========
    let unsubscribe: (() => void) | undefined
    
    try {
      // 监听视图选择变化事件
      // 当用户切换视图、修改筛选条件时，会触发此回调
      if (bitable.base && typeof bitable.base.onSelectionChange === 'function') {
        unsubscribe = bitable.base.onSelectionChange(() => {
          console.log('📊 检测到视图选择变化，重新获取筛选条件')
          getFilterInfo()
        })
        console.log('✅ 已成功订阅视图变化事件')
      } else {
        console.warn('⚠️ onSelectionChange API 不可用')
      }
    } catch (err) {
      console.warn('⚠️ 无法订阅视图变化事件:', err)
    }

    // ========== 方式二：轮询检查（备用方案） ==========
    // 定期检查筛选条件，确保不会遗漏任何变化
    // 即使事件监听失败，也能通过轮询获取最新状态
    const POLLING_INTERVAL = 3000 // 每 3 秒检查一次
    
    const interval = setInterval(() => {
      // 静默检查，不显示加载状态（避免频繁闪烁）
      getFilterInfo()
    }, POLLING_INTERVAL)
    
    console.log(`🔄 已启动轮询检查，间隔: ${POLLING_INTERVAL}ms`)

    // 清理函数：组件卸载时取消监听和轮询
    return () => {
      console.log('🧹 清理监听器和轮询')
      clearInterval(interval)
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            当前筛选条件
          </h2>
          <button
            onClick={getFilterInfo}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base transition-colors"
          >
            {loading ? '获取中...' : '刷新'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm md:text-base">{error}</p>
          </div>
        )}

        {loading && !filterInfo && (
          <div className="text-center py-8">
            <p className="text-gray-500">正在获取筛选条件...</p>
          </div>
        )}

        {!loading && filterInfo && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">视图名称</p>
              <p className="text-base font-medium text-gray-900">
                {filterInfo.viewName}
              </p>
            </div>

            {filterInfo.conditions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                <p>当前没有应用筛选条件</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  筛选条件 ({filterInfo.conditions.length} 条)
                </p>
                {filterInfo.conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">字段名称</p>
                        <p className="text-sm font-medium text-gray-900">
                          {condition.fieldName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">操作符</p>
                        <p className="text-sm font-medium text-gray-900">
                          {getOperatorText(condition.operator)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">筛选值</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatValue(condition.value)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && !filterInfo && !error && (
          <div className="text-center py-8 text-gray-500">
            <p>点击刷新按钮获取筛选条件</p>
          </div>
        )}
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">
          使用说明
        </h3>
        <ul className="space-y-2 text-sm md:text-base text-gray-600">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>插件会自动监听文档筛选条件的变化</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>点击"刷新"按钮可手动获取当前筛选条件</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>筛选条件会实时显示在下方</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}

// 操作符文本映射
function getOperatorText(operator: string): string {
  const operatorMap: Record<string, string> = {
    'is': '等于',
    'isNot': '不等于',
    'contains': '包含',
    'doesNotContain': '不包含',
    'isEmpty': '为空',
    'isNotEmpty': '不为空',
    'isGreater': '大于',
    'isGreaterEqual': '大于等于',
    'isLess': '小于',
    'isLessEqual': '小于等于',
    'isBefore': '早于',
    'isAfter': '晚于',
    'isOnOrBefore': '早于或等于',
    'isOnOrAfter': '晚于或等于',
  }
  return operatorMap[operator] || operator
}

// 格式化值显示
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '-'
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '-'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

