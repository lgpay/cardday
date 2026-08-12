# CardDay

基于 **Cloudflare Workers + D1** 的信用卡账单提醒与状态管理工具。自动计算还款日/免息期，每日定时向企业微信推送还款提醒，并提供一个可直接日用的 Web 看板。

## 功能

- 卡片管理：银行、卡名、尾号、账单日、还款规则、是否已还款
- 银行管理：新增/编辑/删除（有关联卡片时阻止删除）、图标 URL
- 每日提醒：定时检查未还款卡片，通过企业微信发送应用消息（直连或代理模式）
- 自动维护：每日把当日出账卡片重置为「未还款」
- Web 看板：搜索、筛选、排序、一键切换还款状态、增删改卡片/银行/提醒设置
- 后台登录密码（SHA-256 + 盐，存于 D1，明文不落库）

## 技术栈

Cloudflare Workers · D1 · Cron Triggers · 原生 HTML/CSS/JS（无前端框架）

## 快速开始

```bash
npm install
wrangler d1 create cardday-db
wrangler d1 execute cardday-db --file=schema.sql
npm run dev        # 本地预览
npm run deploy     # 手动部署
```

`wrangler.toml` 只写 `database_name`，运行时按名自动解析 `database_id`，仓库不含任何账号级 ID，可自由 fork / 换账号部署。

## 登录密码

密码存于 D1 的 `app_settings.login_password_hash`（哈希）。进入后台 **系统设置 → 后台登录密码** 填写并保存（留空 = 不修改）即可。未设置时默认不启用登录保护。

## 部署（GitHub 自动部署，推荐）

在 Cloudflare 控制台把 `cardday` Worker 绑定到 GitHub 仓库的 `main` 分支，之后每次 push 即自动构建部署，无需仓库内放任何 CI 配置或密钥。

## Cron

表达式按 UTC 触发：

- `0 1 * * *`（UTC = 北京 09:00）：提醒检查与推送
- `0 16 * * *`（UTC = 北京 00:00）：当日出账卡片重置为未还款

业务日期一律按 `Asia/Shanghai`（北京时间）计算。

## License

MIT
