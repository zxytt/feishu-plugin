'use client'

import FilterMonitor from '@/components/FilterMonitor'

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            文档筛选条件监控
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            实时获取并显示文档的筛选条件
          </p>
        </header>
        <FilterMonitor />
      </div>
    </main>
  )
}

