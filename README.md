# CardDay

CardDay 是一个基于 **Cloudflare Workers + D1** 的信用卡账单提醒与状态管理项目。

它主要解决这些事情：
- 记录信用卡账单日 / 还款规则
- 自动计算还款日与免息期
- 每天定时重置“本期未还”状态
- 在到期前自动发送提醒
- 提供一个轻量 Web 看板查看卡片状态
- 通过 API 拉取卡片列表并切换还款状态

## 当前能力

### Worker / 定时任务
- 每天 0 点重置当日出账卡的还款状态
- 每天 9 点检查并发送还款提醒
- 企业微信应用消息提醒

### Web 看板
- 展示卡片列表
- 展示账单日、还款日、免息期
- 展示已还款 / 临近到期 / 逾期状态
- 点击切换“已还款 / 未还款”状态

### API
- `GET /api/cards`：获取卡片列表
- `POST /api/toggle-repaid`：切换还款状态

## 技术栈

- Cloudflare Workers
- Cloudflare D1
- Cron Triggers
- 原生 HTML 模板输出
- ES Modules

## 项目结构

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

把返回的 `database_id` 填入 `wrangler.toml`：

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

### 4. 配置提醒变量

当前提醒逻辑使用 **企业微信应用消息**，需要配置：

- `CORP_ID`
- `CORP_SECRET`
- `AGENT_ID`
- `TO_USER`
- `REMINDER_THRESHOLD`（可选，默认 1）

建议通过 Wrangler secrets / vars 配置。

### 5. 本地开发

```bash
npm run dev
```

### 6. 发布

```bash
npm run deploy
```

## Cron 配置

`wrangler.toml` 默认包含两条计划任务：

- `0 0 * * *`：重置当日账单卡为未还款
- `0 9 * * *`：执行还款提醒检查

## 开发说明

当前 Worker 入口是：

```toml
main = "src/index.js"
```

后续开发应只针对 `src/` 目录进行。

## 接下来建议

下一步值得继续补的能力：

1. 卡片新增 / 编辑 / 删除 API
2. dashboard 筛选、排序和搜索
3. 银行管理与卡片录入界面
4. 基础测试与部署校验
5. 提醒失败告警与日志增强

## License

MIT
