/**
 * 飞书 Bitable API 类型定义
 */

declare global {
  interface Window {
    bitable?: {
      base: {
        getActiveBase(): Promise<BitableBase>
        onSelectionChange(callback: () => void): void
      }
    }
  }
}

export interface BitableBase {
  getActiveTable(): Promise<BitableTable>
}

export interface BitableTable {
  getActiveView(): Promise<BitableView>
  getFieldById(fieldId: string): Promise<BitableField>
}

export interface BitableView {
  id: string
  name: string
  getFilterInfo(): Promise<BitableFilterInfo>
}

export interface BitableField {
  id: string
  name: string
  type: string
}

export interface BitableFilterInfo {
  conditions?: BitableFilterCondition[]
}

export interface BitableFilterCondition {
  field_id: string
  operator?: string
  value?: any
  values?: any[]
}

export {}

