# ccday

一个基于 **Cloudflare Workers + D1** 的信用卡账单提醒与状态管理项目。

> 这个仓库的核心不是旧前端页面，而是 `index.js` 这份 Worker 服务代码。当前已按“可独立维护的新项目”方向整理。

## 核心能力

- 信用卡账单数据存储（D1）
- 自动计算还款日 / 免息期
- 每日定时重置当日出账卡的还款状态
- 每日定时检查并发送还款提醒
- Web 页面查看卡片列表
- 点击切换“已还款 / 未还款”状态
- 表格排序与到期提醒展示

## 技术栈

- Cloudflare Workers
- Cloudflare D1
- Cron Triggers
- 原生 HTML 输出（Worker 直接返回页面）
- `date-fns`（已打包进 `index.js`）

## 当前仓库结构

```text
index.js              # Worker 主程序（核心）
wrangler.toml         # Cloudflare Worker 配置示例
schema.sql            # D1 数据库初始化 SQL
README.md             # 项目说明
legacy/               # 旧前端实验文件（非核心）
```

## 快速开始

### 1. 安装 Wrangler

```bash
npm install -g wrangler
```

### 2. 创建 D1 数据库

```bash
wrangler d1 create ccday-db
```

把返回的数据库信息填入 `wrangler.toml`。

### 3. 初始化表结构

```bash
wrangler d1 execute ccday-db --file=schema.sql
```

### 4. 本地开发

```bash
wrangler dev
```

### 5. 发布

```bash
wrangler deploy
```

## 定时任务

项目依赖 Cron Triggers：

- 每天 **0 点**：把当日账单日的卡重置为“未还款”
- 每天 **9 点**：检查并发送提醒

可在 `wrangler.toml` 中配置。

## 环境变量 / 绑定

你需要至少配置：

- `DB`：D1 数据库绑定
- （如果提醒逻辑里需要）Telegram / Bot 相关环境变量

## 关于旧文件

仓库原先有一套本地前端页面文件：

- `index.html`
- `app.js`
- `styles.css`

这些不是当前项目核心，已移入 `legacy/`，避免和 Worker 主程序混淆。

## 后续建议

下一步最值得做的是：

1. 给 `index.js` 反编译/源码化重构
2. 把 Worker 主逻辑拆分成模块
3. 把 HTML 模板独立出去
4. 补 `.gitignore`
5. 明确提醒发送渠道配置

## License

MIT
