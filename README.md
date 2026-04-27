# CardDay

CardDay 是一个基于 **Cloudflare Workers + D1** 的信用卡账单提醒与状态管理项目。

它解决的是这类需求：
- 记录信用卡账单日 / 还款规则
- 自动计算还款日与免息期
- 每天定时重置“本期未还”状态
- 在到期前自动发送提醒
- 提供一个轻量 Web 看板查看当前卡片状态

## 当前状态

当前仓库已经完成：

- 项目从旧实验仓库中独立为 **CardDay**
- Worker 入口从单文件打包产物开始拆分为源码结构
- 已建立 `src/`、`lib/`、`templates/` 的模块化目录
- 已移除旧前端 `legacy/`
- 已补基础工程文件：`.gitignore`、`package.json`、`wrangler.toml`

## 技术栈

- Cloudflare Workers
- Cloudflare D1
- Cron Triggers
- 原生 HTML 模板输出
- ES Modules

## 目录结构

```text
src/
  index.js                 # Worker 入口
  lib/
    billing.js             # 账单/还款计算
    db.js                  # D1 查询与写入
    http.js                # CORS / HTTP 辅助
    reminder.js            # 提醒发送逻辑
  templates/
    dashboard.js           # 看板 HTML 模板
  vendor/
    date-fns-lite.js       # 当前使用的轻量日期工具

index.bundle.js            # 旧打包产物备份（仅供参考）
schema.sql                 # D1 初始化 SQL
wrangler.toml              # Worker 配置
package.json               # 基础工程配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 创建 D1 数据库

```bash
wrangler d1 create cardday-db
```

将返回的 `database_id` 填入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "cardday-db"
database_id = "REPLACE_WITH_YOUR_D1_DATABASE_ID"
```

### 3. 初始化数据库

```bash
wrangler d1 execute cardday-db --file=schema.sql
```

### 4. 本地开发

```bash
npm run dev
```

### 5. 发布

```bash
npm run deploy
```

## 定时任务

`wrangler.toml` 里默认配置了两条 Cron：

- `0 0 * * *`：每天 0 点重置当日账单卡的“已还款”状态
- `0 9 * * *`：每天 9 点执行还款提醒检查

## 环境变量

当前提醒逻辑使用 **企业微信应用消息**，你需要配置：

- `CORP_ID`
- `CORP_SECRET`
- `AGENT_ID`
- `TO_USER`
- `REMINDER_THRESHOLD`（可选，默认 1）

这些变量可通过 Wrangler secrets / vars 配置。

## 开发说明

### 当前入口

Worker 现在以：

```toml
main = "src/index.js"
```

运行。

### 关于 `index.bundle.js`

仓库里保留了旧打包产物备份，仅用于：
- 对照旧逻辑
- 手工迁移功能
- 校验拆分后的行为

后续功能开发应只针对 `src/` 目录进行。

## 下一步建议

后续值得继续做的方向：

1. 完善 dashboard 交互（筛选、排序、状态切换）
2. 补银行管理 / 卡片录入 API
3. 为模板和账单计算增加测试
4. 将轻量日期工具替换为正式依赖或继续内建
5. 明确部署文档与告警策略

## License

MIT
