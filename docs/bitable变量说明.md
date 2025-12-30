# bitable 变量说明

## bitable 从哪里来？

`bitable` 是**飞书文档环境自动注入的全局对象**，通过 `window.bitable` 访问。

## 工作原理

### 1. 飞书环境注入

当你的插件在飞书文档（多维表格）中运行时，飞书会自动在浏览器的 `window` 对象上注入 `bitable` 对象：

```javascript
// 飞书环境自动提供
window.bitable = {
  base: {
    getActiveBase: () => {...},
    onSelectionChange: (callback) => {...}
  }
}
```

### 2. 代码中的使用方式

在代码中，我们通过以下方式获取 `bitable`：

```typescript
// 检查是否在飞书环境中
if (typeof window === 'undefined' || !(window as any).bitable) {
  throw new Error('请在飞书文档环境中使用此插件')
}

// 获取 bitable 对象
const bitable = (window as any).bitable
```

### 3. 完整示例

```typescript
// 在 FilterMonitor.tsx 中的实际使用
const getFilterInfo = async () => {
  // 1. 检查环境
  if (typeof window === 'undefined' || !(window as any).bitable) {
    throw new Error('请在飞书文档环境中使用此插件')
  }

  // 2. 获取 bitable 对象
  const bitable = (window as any).bitable
  
  // 3. 使用 bitable API
  const base = await bitable.base.getActiveBase()
  const table = await base.getActiveTable()
  const view = await table.getActiveView()
  const filterInfo = await view.getFilterInfo()
  
  // 4. 处理数据
  // ...
}
```

## 关键点

### ✅ 自动提供，无需安装

- `bitable` **不需要安装任何 npm 包**
- 飞书环境**自动注入**到 `window.bitable`
- 这是飞书提供的**客户端 API**

### ✅ 只在飞书环境中存在

- 在普通浏览器中：`window.bitable` 为 `undefined`
- 在飞书文档中：`window.bitable` 自动存在
- 所以需要**环境检查**

### ✅ 类型定义

我们在 `types/bitable.d.ts` 中定义了类型：

```typescript
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
```

这样 TypeScript 就能识别 `window.bitable` 的类型。

## 使用流程

```
1. 用户在飞书文档中打开插件
   ↓
2. 飞书环境加载插件页面
   ↓
3. 飞书自动注入 window.bitable 对象
   ↓
4. 插件代码检查 window.bitable 是否存在
   ↓
5. 如果存在，使用 bitable API 获取数据
   ↓
6. 如果不存在，显示错误提示
```

## 常见问题

### Q: 为什么在本地浏览器中 bitable 不存在？

A: 因为 `bitable` 是飞书环境提供的，只有在飞书文档中运行时才会存在。这是正常的，插件需要在飞书环境中使用。

### Q: 需要安装什么包来使用 bitable 吗？

A: **不需要**。`bitable` 是飞书环境自动提供的，不需要安装任何 npm 包。

### Q: 如何测试 bitable API？

A: 在飞书文档中打开插件，然后在浏览器控制台运行：

```javascript
// 检查 bitable 是否存在
console.log(window.bitable)

// 测试获取表格
const base = await window.bitable.base.getActiveBase()
console.log(base)
```

### Q: bitable 有哪些 API？

A: 参考飞书官方文档：
- [飞书 Bitable API 文档](https://open.feishu.cn/document/server-docs/docs/bitable-v1/overview)
- [客户端 API 文档](https://open.feishu.cn/document/client-docs/docs/bitable-v1/overview)

## 代码位置

在项目中的使用位置：

1. **获取 bitable**：
   ```35:35:components/FilterMonitor.tsx
   const bitable = (window as any).bitable
   ```

2. **类型定义**：
   ```5:14:types/bitable.d.ts
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
   ```

3. **环境检查**：
   ```31:33:components/FilterMonitor.tsx
   if (typeof window === 'undefined' || !(window as any).bitable) {
     throw new Error('请在飞书文档环境中使用此插件')
   }
   ```

## 总结

- `bitable` = `window.bitable`（飞书环境自动注入）
- **不需要安装**任何包
- **只在飞书文档环境中**存在
- 使用前需要**检查是否存在**
- 通过 TypeScript 类型定义获得类型提示

