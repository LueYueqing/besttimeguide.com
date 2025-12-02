# Clean Code 代码审查指南

基于 Robert C. Martin 的 Clean Code 原则，针对 Next.js 15 + TypeScript + React 项目的代码审查标准。

## 📋 审查频率建议

- **每周审查**：新功能代码、关键业务逻辑
- **每月审查**：整体代码质量、技术债务清理
- **发布前审查**：所有变更代码、安全相关代码
- **重构前审查**：识别需要重构的代码区域

## 🎯 Clean Code 核心原则

### 1. 有意义的命名（Meaningful Names）

**审查要点**：
- ✅ 变量、函数、类名清晰表达意图
- ✅ 避免缩写和魔法数字
- ✅ 使用一致的命名约定
- ✅ 布尔值使用 `is`、`has`、`should` 前缀

**示例**：

```typescript
// ❌ 差
const d = new Date()
const u = getUser()
const flag = true

// ✅ 好
const currentDate = new Date()
const currentUser = getUser()
const isAuthenticated = true
```

**Next.js 特定**：
- ✅ 页面文件使用 `page.tsx`
- ✅ 布局文件使用 `layout.tsx`
- ✅ API 路由使用 `route.ts`
- ✅ 组件文件使用 PascalCase：`UserProfile.tsx`
- ✅ 工具函数使用 camelCase：`formatDate.ts`

### 2. 函数应该做一件事（Functions Do One Thing）

**审查要点**：
- ✅ 函数长度不超过 50 行（理想 < 20 行）
- ✅ 单一职责原则（SRP）
- ✅ 函数名准确描述功能
- ✅ 避免副作用（纯函数优先）

**示例**：

```typescript
// ❌ 差：函数做了太多事情
async function handleUserAction(userId: string, action: string) {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')
  
  if (action === 'update') {
    await db.user.update({ where: { id: userId }, data: { ... } })
    await sendEmail(user.email, 'Profile updated')
    await logActivity(userId, 'update')
  } else if (action === 'delete') {
    await db.user.delete({ where: { id: userId } })
    await sendEmail(user.email, 'Account deleted')
    await logActivity(userId, 'delete')
  }
}

// ✅ 好：拆分为多个单一职责的函数
async function updateUser(userId: string, data: UpdateUserData) {
  const user = await getUserById(userId)
  await db.user.update({ where: { id: userId }, data })
  await notifyUserUpdate(user)
  await logUserActivity(userId, 'update')
}

async function deleteUser(userId: string) {
  const user = await getUserById(userId)
  await db.user.delete({ where: { id: userId } })
  await notifyUserDeletion(user)
  await logUserActivity(userId, 'delete')
}
```

### 3. 注释（Comments）

**审查要点**：
- ✅ 代码应该自解释，减少注释需求
- ✅ 注释解释"为什么"，而不是"是什么"
- ✅ 删除过时和误导性注释
- ✅ 复杂业务逻辑必须有注释

**示例**：

```typescript
// ❌ 差：注释解释显而易见的代码
// 获取用户
const user = await getUser()

// ✅ 好：注释解释业务逻辑
// 使用缓存策略避免频繁查询数据库，因为用户数据变化频率低
const user = await getUserWithCache(userId)

// ✅ 好：解释复杂算法或业务规则
// 根据 Stripe 订阅状态和试用期计算用户有效计划
// 优先级：试用期 > 活跃订阅 > 默认免费计划
function getUserEffectivePlan(user: User): Plan {
  // ...
}
```

### 4. 格式（Formatting）

**审查要点**：
- ✅ 使用 Prettier 自动格式化
- ✅ 一致的缩进（2 空格）
- ✅ 行长度不超过 100 字符
- ✅ 导入语句分组和排序

**Prettier 配置示例**：

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### 5. 错误处理（Error Handling）

**审查要点**：
- ✅ 使用异常而非返回码
- ✅ 提供有意义的错误消息
- ✅ 不要忽略异常
- ✅ 区分可恢复和不可恢复错误

**示例**：

```typescript
// ❌ 差：忽略错误或返回 null
async function getUser(id: string) {
  try {
    return await db.user.findUnique({ where: { id } })
  } catch {
    return null
  }
}

// ✅ 好：明确的错误处理
async function getUser(id: string): Promise<User> {
  const user = await db.user.findUnique({ where: { id } })
  if (!user) {
    throw new NotFoundError(`User with id ${id} not found`)
  }
  return user
}

// ✅ 好：API 路由中的错误处理
export async function GET(request: Request) {
  try {
    const user = await getUser(userId)
    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 🔍 Next.js 15 特定审查要点

### 1. App Router 结构

**审查清单**：
- [ ] 页面文件使用 `page.tsx`
- [ ] 布局文件使用 `layout.tsx`
- [ ] 路由组使用 `(group)` 命名
- [ ] 动态路由使用 `[param]` 格式
- [ ] 并行路由和拦截路由使用正确

**示例**：

```typescript
// ✅ 正确的 App Router 结构
app/
├── layout.tsx              # 根布局
├── page.tsx                # 首页
├── (marketing)/            # 路由组（不影响URL）
│   ├── about/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
├── dashboard/
│   ├── layout.tsx          # 仪表板布局
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx        # 动态路由
└── api/
    └── users/
        └── route.ts        # API 路由
```

### 2. 服务器组件 vs 客户端组件

**审查要点**：
- ✅ 默认使用服务器组件
- ✅ 仅在需要交互时使用 `'use client'`
- ✅ 避免在服务器组件中导入客户端组件
- ✅ 正确使用 `async/await` 在服务器组件中

**示例**：

```typescript
// ✅ 服务器组件（默认）
// app/users/page.tsx
export default async function UsersPage() {
  const users = await getUsers() // 直接访问数据库
  
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}

// ✅ 客户端组件（需要交互）
// components/UserCard.tsx
'use client'

import { useState } from 'react'

export function UserCard({ user }: { user: User }) {
  const [liked, setLiked] = useState(false)
  
  return (
    <div>
      <h3>{user.name}</h3>
      <button onClick={() => setLiked(!liked)}>
        {liked ? '❤️' : '🤍'}
      </button>
    </div>
  )
}
```

### 3. Metadata API

**审查要点**：
- ✅ 使用 Next.js 15 Metadata API
- ✅ 所有页面配置 metadata
- ✅ 动态 metadata 使用 `generateMetadata`
- ✅ Open Graph 和 Twitter Cards 配置完整

**示例**：

```typescript
// ✅ 静态 metadata
export const metadata: Metadata = {
  title: 'User Profile',
  description: 'View and edit your profile',
  openGraph: {
    title: 'User Profile',
    description: 'View and edit your profile',
    images: ['/og-image.png'],
  },
}

// ✅ 动态 metadata
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const user = await getUser(params.id)
  
  return {
    title: `${user.name} - Profile`,
    description: `Profile page for ${user.name}`,
  }
}
```

### 4. API 路由规范

**审查清单**：
- [ ] 使用标准的 HTTP 方法（GET, POST, PUT, DELETE）
- [ ] 统一的响应格式
- [ ] 错误处理完整
- [ ] 参数验证
- [ ] 认证和授权检查
- [ ] Rate limiting（如需要）

**示例**：

```typescript
// ✅ 标准的 API 路由
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. 认证检查
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // 2. 参数验证
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)
    
    // 3. 业务逻辑
    const user = await createUser(validatedData)
    
    // 4. 返回统一格式
    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 📝 TypeScript 代码质量

### 1. 类型安全

**审查要点**：
- ✅ 避免使用 `any`
- ✅ 使用明确的类型而非 `unknown`（除非必要）
- ✅ 利用 TypeScript 类型推断
- ✅ 使用类型别名和接口提高可读性

**示例**：

```typescript
// ❌ 差：使用 any
function processData(data: any) {
  return data.value * 2
}

// ✅ 好：明确的类型
interface Data {
  value: number
}

function processData(data: Data): number {
  return data.value * 2
}

// ✅ 好：使用类型推断
const users = await getUsers() // TypeScript 自动推断类型
```

### 2. 类型定义组织

**审查要点**：
- ✅ 类型定义放在 `types/` 目录
- ✅ 共享类型使用 `types/index.ts`
- ✅ 组件特定类型放在组件文件顶部
- ✅ 使用 `type` vs `interface` 一致

**示例**：

```typescript
// types/user.ts
export type UserRole = 'admin' | 'user' | 'guest'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
}

// types/index.ts
export * from './user'
export * from './api'
```

### 3. 泛型使用

**审查要点**：
- ✅ 合理使用泛型提高代码复用
- ✅ 泛型名称有意义（T, U 仅用于简单场景）
- ✅ 提供默认类型参数

**示例**：

```typescript
// ✅ 好的泛型使用
interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  // ...
}

// ✅ 有意义的泛型名称
interface Repository<Entity, Id = string> {
  findById(id: Id): Promise<Entity | null>
  save(entity: Entity): Promise<Entity>
}
```

## ⚛️ React 组件审查

### 1. 组件设计原则

**审查清单**：
- [ ] 组件单一职责
- [ ] Props 接口清晰
- [ ] 避免过深的组件嵌套（< 5 层）
- [ ] 合理拆分大组件
- [ ] 使用组合而非继承

**示例**：

```typescript
// ❌ 差：组件职责过多
function UserDashboard({ user }: { user: User }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <UserProfile user={user} />
      <UserStats user={user} />
      <UserSettings user={user} />
      <RecentActivity user={user} />
      <Recommendations user={user} />
    </div>
  )
}

// ✅ 好：拆分为更小的组件
function UserDashboard({ user }: { user: User }) {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <UserProfileSection user={user} />
      <UserStatsSection user={user} />
      <DashboardSidebar>
        <RecentActivity user={user} />
        <Recommendations user={user} />
      </DashboardSidebar>
    </DashboardLayout>
  )
}
```

### 2. Hooks 使用规范

**审查要点**：
- ✅ 自定义 Hooks 以 `use` 开头
- ✅ Hooks 单一职责
- ✅ 避免在循环和条件中使用 Hooks
- ✅ 正确使用依赖数组

**示例**：

```typescript
// ✅ 好的自定义 Hook
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    getUserById(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])
  
  return { user, loading, error }
}

// ✅ 使用
function UserProfile({ userId }: { userId: string }) {
  const { user, loading, error } = useUser(userId)
  
  if (loading) return <Loading />
  if (error) return <Error message={error.message} />
  if (!user) return <NotFound />
  
  return <ProfileContent user={user} />
}
```

### 3. 性能优化

**审查要点**：
- ✅ 使用 `React.memo` 避免不必要的重渲染
- ✅ 使用 `useMemo` 和 `useCallback` 优化计算
- ✅ 避免在渲染中创建新对象/函数
- ✅ 合理使用代码分割

**示例**：

```typescript
// ❌ 差：每次渲染创建新对象
function UserList({ users }: { users: User[] }) {
  const filterConfig = { role: 'admin' } // 新对象
  const filteredUsers = users.filter(u => u.role === filterConfig.role)
  
  return <List items={filteredUsers} />
}

// ✅ 好：使用 useMemo
function UserList({ users }: { users: User[] }) {
  const filterConfig = useMemo(() => ({ role: 'admin' }), [])
  const filteredUsers = useMemo(
    () => users.filter(u => u.role === filterConfig.role),
    [users, filterConfig]
  )
  
  return <List items={filteredUsers} />
}

// ✅ 好：使用 React.memo
const UserCard = React.memo(function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>
})
```

## 🗄️ 数据库操作审查

### 1. Prisma 查询优化

**审查要点**：
- ✅ 避免 N+1 查询问题
- ✅ 使用 `select` 只查询需要的字段
- ✅ 合理使用 `include` 和 `select`
- ✅ 使用事务处理相关操作

**示例**：

```typescript
// ❌ 差：N+1 查询
const users = await db.user.findMany()
for (const user of users) {
  const posts = await db.post.findMany({ where: { userId: user.id } })
  // 每个用户都执行一次查询
}

// ✅ 好：使用 include
const users = await db.user.findMany({
  include: {
    posts: true, // 一次查询获取所有数据
  },
})

// ✅ 好：只选择需要的字段
const users = await db.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // 不选择 password 等敏感字段
  },
})
```

### 2. 错误处理

**审查要点**：
- ✅ 处理数据库连接错误
- ✅ 处理唯一约束冲突
- ✅ 处理外键约束错误
- ✅ 提供有意义的错误消息

**示例**：

```typescript
// ✅ 好的错误处理
async function createUser(data: CreateUserData) {
  try {
    return await db.user.create({ data })
  } catch (error) {
    if (error.code === 'P2002') {
      // Prisma 唯一约束错误
      throw new ConflictError('Email already exists')
    }
    if (error.code === 'P2003') {
      // Prisma 外键约束错误
      throw new BadRequestError('Invalid reference')
    }
    throw error
  }
}
```

## 🔒 安全检查

### 1. 认证和授权

**审查清单**：
- [ ] 所有受保护路由检查认证
- [ ] 使用服务器端会话验证
- [ ] 敏感操作需要额外授权
- [ ] 避免客户端信任用户输入

**示例**：

```typescript
// ✅ 好的认证检查
export async function GET(request: NextRequest) {
  const session = await getServerSession()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // 使用服务器端会话中的用户ID，不要信任客户端
  const user = await getUserById(session.user.id)
  return NextResponse.json(user)
}
```

### 2. 输入验证

**审查要点**：
- ✅ 所有用户输入必须验证
- ✅ 使用 Zod 或类似库进行验证
- ✅ 验证数据类型、格式、范围
- ✅ 清理和转义用户输入

**示例**：

```typescript
// ✅ 使用 Zod 验证
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
})

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const validatedData = updateUserSchema.parse(body) // 自动验证
  
  // 使用验证后的数据
  await updateUser(validatedData)
}
```

### 3. SQL 注入防护

**审查要点**：
- ✅ 使用 Prisma 参数化查询（自动防护）
- ✅ 避免原始 SQL 查询
- ✅ 如必须使用原始 SQL，使用参数化查询

**示例**：

```typescript
// ✅ 好：使用 Prisma（自动防护 SQL 注入）
const user = await db.user.findUnique({
  where: { email: userEmail }, // 自动参数化
})

// ❌ 差：原始 SQL（危险）
const user = await db.$queryRaw`
  SELECT * FROM users WHERE email = ${userEmail}
` // 即使使用模板字符串，也要小心

// ✅ 好：如果必须使用原始 SQL，使用参数化
const user = await db.$queryRaw`
  SELECT * FROM users WHERE email = ${userEmail}
` // Prisma 的 $queryRaw 是安全的
```

## 📊 性能审查

### 1. 代码分割

**审查要点**：
- ✅ 使用动态导入进行代码分割
- ✅ 路由级别的代码分割（Next.js 自动）
- ✅ 大型组件使用 `lazy` 加载

**示例**：

```typescript
// ✅ 动态导入
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
  ssr: false, // 如果不需要 SSR
})

// ✅ 路由级别自动代码分割（Next.js 自动处理）
// app/dashboard/page.tsx 会自动代码分割
```

### 2. 图片优化

**审查要点**：
- ✅ 使用 Next.js `Image` 组件
- ✅ 提供 `width` 和 `height` 避免 CLS
- ✅ 使用 WebP 格式
- ✅ 使用 `loading="lazy"` 进行懒加载

**示例**：

```typescript
// ✅ 好的图片使用
import Image from 'next/image'

<Image
  src="/hero-image.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority // 首屏图片
  loading="lazy" // 非首屏图片
/>
```

### 3. 数据库查询优化

**审查要点**：
- ✅ 避免在循环中查询数据库
- ✅ 使用索引优化查询
- ✅ 使用分页避免大量数据查询
- ✅ 使用缓存减少数据库压力

**示例**：

```typescript
// ✅ 好的分页查询
async function getUsers(page: number, pageSize: number = 10) {
  return await db.user.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  })
}

// ✅ 使用缓存
import { cache } from 'react'

export const getCachedUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } })
})
```

## 📋 代码审查检查清单

### 通用代码质量

- [ ] **命名**：变量、函数、类名清晰表达意图
- [ ] **函数长度**：单个函数不超过 50 行
- [ ] **函数职责**：每个函数只做一件事
- [ ] **注释**：代码自解释，注释解释"为什么"
- [ ] **格式**：使用 Prettier 统一格式
- [ ] **错误处理**：所有错误都有适当处理
- [ ] **类型安全**：避免使用 `any`，类型定义完整

### Next.js 特定

- [ ] **App Router**：正确使用 `page.tsx`、`layout.tsx`、`route.ts`
- [ ] **服务器组件**：默认使用服务器组件，仅在需要时使用客户端组件
- [ ] **Metadata**：所有页面配置完整的 metadata
- [ ] **API 路由**：使用标准 HTTP 方法，统一响应格式
- [ ] **错误处理**：API 路由有完整的错误处理

### TypeScript

- [ ] **类型定义**：避免 `any`，使用明确类型
- [ ] **类型组织**：类型定义放在 `types/` 目录
- [ ] **泛型使用**：合理使用泛型提高复用性

### React 组件

- [ ] **组件职责**：组件单一职责，合理拆分
- [ ] **Hooks 使用**：正确使用 Hooks，自定义 Hooks 命名规范
- [ ] **性能优化**：合理使用 `memo`、`useMemo`、`useCallback`
- [ ] **Props 接口**：Props 类型定义清晰

### 数据库操作

- [ ] **N+1 问题**：避免 N+1 查询，使用 `include`
- [ ] **字段选择**：使用 `select` 只查询需要的字段
- [ ] **事务处理**：相关操作使用事务
- [ ] **错误处理**：处理数据库错误，提供有意义的错误消息

### 安全

- [ ] **认证检查**：受保护路由检查认证
- [ ] **输入验证**：所有用户输入必须验证
- [ ] **SQL 注入**：使用 Prisma 参数化查询
- [ ] **敏感数据**：不在客户端暴露敏感信息

### 性能

- [ ] **代码分割**：使用动态导入进行代码分割
- [ ] **图片优化**：使用 Next.js `Image` 组件
- [ ] **查询优化**：避免循环查询，使用分页和缓存

## 🔄 定期审查流程

### 1. 每周审查（新功能代码）

**范围**：
- 本周新增的代码文件
- 修改的关键业务逻辑
- 新增的 API 路由

**步骤**：
1. 使用 Git 查看本周变更：`git log --since="1 week ago"`
2. 逐个文件审查，使用检查清单
3. 记录问题和改进建议
4. 创建 Issue 或 TODO 跟踪问题

### 2. 每月审查（整体代码质量）

**范围**：
- 所有主要模块
- 技术债务识别
- 性能瓶颈分析

**步骤**：
1. 使用代码分析工具（ESLint、TypeScript 编译器）
2. 审查代码重复和复杂度
3. 识别需要重构的代码区域
4. 更新技术债务清单

### 3. 发布前审查（所有变更）

**范围**：
- 本次发布的所有变更
- 安全相关代码
- 性能关键路径

**步骤**：
1. 审查所有 Pull Request
2. 运行完整的测试套件
3. 安全检查（认证、授权、输入验证）
4. 性能测试（关键路径）

### 4. 重构前审查（识别重构目标）

**范围**：
- 高复杂度的函数和组件
- 重复代码
- 难以测试的代码

**步骤**：
1. 使用代码复杂度工具
2. 识别重复代码模式
3. 评估重构优先级
4. 制定重构计划

## 🛠️ 辅助工具

### 1. 代码分析工具

```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npx tsc --noEmit

# 代码复杂度分析（需要安装）
npm install -D complexity-report
npx cr . --format json
```

### 2. Git 审查命令

```bash
# 查看本周变更
git log --since="1 week ago" --name-only

# 查看特定文件的变更历史
git log --follow -- app/api/users/route.ts

# 查看代码统计
git diff --stat main..feature-branch
```

### 3. 代码质量指标

- **圈复杂度**：函数复杂度 < 10
- **代码重复率**：< 3%
- **测试覆盖率**：> 80%
- **TypeScript 严格模式**：启用

## 📝 审查报告模板

### 审查报告

**审查日期**：2025-01-XX  
**审查范围**：XXX 功能模块  
**审查人**：XXX

#### 发现的问题

1. **严重问题**（必须修复）
   - [ ] 问题描述
   - [ ] 文件位置
   - [ ] 修复建议

2. **中等问题**（建议修复）
   - [ ] 问题描述
   - [ ] 文件位置
   - [ ] 修复建议

3. **轻微问题**（可选修复）
   - [ ] 问题描述
   - [ ] 文件位置
   - [ ] 修复建议

#### 代码质量评分

- **命名清晰度**：X/10
- **函数复杂度**：X/10
- **类型安全**：X/10
- **错误处理**：X/10
- **性能优化**：X/10

**总分**：XX/50

#### 改进建议

1. 建议 1
2. 建议 2
3. 建议 3

---

## 🎓 参考资源

- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)

---

**记住**：代码审查的目标不是批评，而是提高代码质量，让项目更易维护和扩展。保持开放的心态，持续改进！

