# 数据库迁移到 PostgreSQL 指南

## 已完成的更改

### 1. Prisma Schema 更新
- ✅ 将 `datasource provider` 从 `mysql` 改为 `postgresql`
- ✅ 将 `@db.LongText` 改为 `@db.Text`（PostgreSQL 使用 TEXT 类型）
- ✅ `@db.Decimal(10, 2)` 保持不变（PostgreSQL 支持 DECIMAL 类型）

### 2. Migration 文件更新
- ✅ 更新了 `20250116000000_add_categories_and_articles/migration.sql` 使用 PostgreSQL 语法
- ✅ 使用 `SERIAL` 替代 `AUTO_INCREMENT`
- ✅ 使用 `TIMESTAMP(3)` 替代 `DATETIME(3)`
- ✅ 移除了 MySQL 特定的语法（如 `ENGINE=InnoDB`, `CHARSET` 等）

### 3. 环境变量配置
- ✅ 更新了 `env.example` 文件，包含 PostgreSQL 连接字符串示例

## 配置步骤

### 1. 设置环境变量

在 `.env` 文件中添加以下配置：

```env
# 推荐使用带连接池的连接字符串（适用于大多数场景）
DATABASE_URL="postgresql://neondb_owner:npg_F26QfAiLDYJS@ep-rough-unit-a40frcro-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# 对于需要非连接池连接的场景（如迁移）
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_F26QfAiLDYJS@ep-rough-unit-a40frcro.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 2. 运行数据库迁移

```bash
# 生成 Prisma Client
npx prisma generate

# 运行迁移（如果数据库已存在）
npx prisma migrate deploy

# 或者，如果是新数据库，运行开发迁移
npx prisma migrate dev
```

### 3. 验证连接

```bash
# 测试数据库连接
npx prisma db pull

# 查看数据库结构
npx prisma studio
```

## 注意事项

### Neon PostgreSQL 特性
- Neon 使用连接池（pooler）来优化连接管理
- 推荐使用带 `-pooler` 的连接字符串用于应用连接
- 迁移操作应使用非连接池连接（`DATABASE_URL_UNPOOLED`）

### 数据类型差异

| MySQL | PostgreSQL | 说明 |
|-------|------------|------|
| `LONGTEXT` | `TEXT` | PostgreSQL 的 TEXT 类型可以存储任意长度 |
| `DATETIME(3)` | `TIMESTAMP(3)` | 时间戳类型 |
| `AUTO_INCREMENT` | `SERIAL` | 自增主键 |
| `DECIMAL(10,2)` | `DECIMAL(10,2)` | 相同 |

### 迁移现有数据

如果从 MySQL 迁移现有数据：

1. **导出 MySQL 数据**
   ```bash
   mysqldump -u user -p database_name > backup.sql
   ```

2. **转换数据格式**（可能需要手动调整）
   - 时间格式：MySQL 的 DATETIME 需要转换为 PostgreSQL 的 TIMESTAMP
   - 字符集：确保 UTF-8 编码

3. **导入到 PostgreSQL**
   ```bash
   psql -h host -U user -d database_name < backup.sql
   ```

## 常见问题

### Q: 迁移时出现连接错误？
A: 确保使用正确的连接字符串，并且 SSL 模式设置为 `require`。

### Q: 如何切换回 MySQL？
A: 将 `prisma/schema.prisma` 中的 `provider` 改回 `mysql`，并更新相应的 migration 文件。

### Q: Neon 连接池的限制？
A: Neon 的连接池有连接数限制，对于高并发场景，考虑使用非连接池连接或增加连接池大小。

## 下一步

1. ✅ 更新 `.env` 文件中的 `DATABASE_URL`
2. ✅ 运行 `npx prisma generate` 生成新的 Prisma Client
3. ✅ 运行 `npx prisma migrate deploy` 应用迁移
4. ✅ 运行 `npm run seed-articles` 填充测试数据
5. ✅ 测试应用功能，确保一切正常

## 参考资源

- [Prisma PostgreSQL 文档](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Neon PostgreSQL 文档](https://neon.tech/docs)
- [PostgreSQL 数据类型](https://www.postgresql.org/docs/current/datatype.html)

