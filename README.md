# CardDay

CardDay 是一个基于 **Cloudflare Workers + D1** 的信用卡账单提醒与状态管理项目。

它的目标很直接：

- 管理多张信用卡的账单规则
- 自动计算还款日和免息期
- 每天定时检查待还款卡片
- 通过企业微信发送还款提醒
- 提供一个轻量但可直接日用的 Web 看板

适合放在 Cloudflare Workers 上长期跑，基本不用自己维护服务端机器。

---

## 功能概览

### 1. 卡片管理

支持维护信用卡的核心信息：

- 所属银行
- 卡片名称
- 卡号尾号（可选）
- 账单日
- 还款规则
  - 固定还款日
  - 账单日后 N 天
- 是否“账单日当天消费计入下期账单”
- 是否已还款

### 2. 银行管理

支持单独维护银行列表：

- 新增银行
- 编辑银行
- 删除银行（有卡片关联时会阻止删除）
- 为银行配置图标 URL（可选）

### 3. 提醒能力

支持每日自动提醒与手动测试：

- 每天 9:00 检查提醒范围内的未还款卡片
- 向企业微信发送应用消息
- 支持“发送测试消息”检查链路是否通
- 支持“立即试发”模拟当前提醒检查结果

### 4. 自动状态维护

- 每天 0:00 自动把当日出账卡片重置为“未还款”

### 5. Web 看板

内置一个可直接使用的后台页面，支持：

- 卡片总览
- 搜索
- 按银行筛选
- 按状态快速筛选
- 按字段排序
- 一键切换已还款 / 未还款
- 新增 / 编辑 / 删除卡片
- 银行管理
- 提醒设置管理

---

## 提醒发送模式

CardDay 当前支持两种企业微信发送模式。

### 1. 直连模式

直接请求企业微信官方接口：

- `https://qyapi.weixin.qq.com/cgi-bin/gettoken`
- `https://qyapi.weixin.qq.com/cgi-bin/message/send`

适合可以正常访问企业微信官方接口的环境。

### 2. 代理模式

如果你的环境不方便直连企业微信接口，可以配置一个代理根地址，例如：

```text
https://your-proxy.example.com
```

系统会自动拼接：

- `/cgi-bin/gettoken`
- `/cgi-bin/message/send`

> 也就是说，这里的代理地址应该是企业微信 API 的“根地址代理”，而不是完整接口地址。

---

## 技术栈

- Cloudflare Workers
- Cloudflare D1
- Cron Triggers
- 原生 HTML + CSS + JS
- ES Modules

没有引入前端框架，页面由 Worker 直接输出，部署简单、依赖少。

---

## 项目结构

```text
src/
  index.js                 # Worker 入口，路由/API/cron 调度
  lib/
    auth.js                # 登录会话相关逻辑
    billing.js             # 账单/还款日/免息期计算
    db.js                  # D1 查询与写入
    http.js                # CORS / Cookie / HTTP 辅助
    reminder.js            # 企业微信提醒发送逻辑
  templates/
    dashboard.js           # Web 看板页面模板
    login.js               # 登录页模板
  vendor/
    date-fns-lite.js       # 轻量日期工具

schema.sql                 # D1 初始化 SQL
wrangler.toml              # Worker 配置
package.json               # 项目脚本与依赖
```

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 创建 D1 数据库

```bash
wrangler d1 create cardday-db
```

把输出里的 `database_id` 写入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "cardday-db"
database_id = "REPLACE_WITH_YOUR_D1_DATABASE_ID"
```

> 不要把真实 `database_id`、私有域名、Token、Secret 之类的值直接提交到公开仓库。
> 示例配置请始终使用占位符。

### 3. 初始化数据库

```bash
wrangler d1 execute cardday-db --file=schema.sql
```

### 4. 配置 Worker 变量 / Secret

#### 企业微信相关

建议至少配置以下参数：

- `CORP_ID`
- `CORP_SECRET`
- `AGENT_ID`
- `TO_USER`

可选：

- `REMINDER_THRESHOLD`：默认提前提醒天数，默认 `1`
- `LOGIN_PASSWORD`：开启后台登录密码

可以通过 Wrangler 配置：

```bash
wrangler secret put CORP_SECRET
```

其他非敏感变量也可以写进 `wrangler.toml` 或通过 dashboard 页面保存到 D1。

> 说明：
> - 页面里保存的提醒配置会优先用于发送。
> - 如果页面里没填，才会回退使用 Worker 环境变量。

### 5. 本地开发

```bash
npm run dev
```

### 6. 部署

```bash
npm run deploy
```

在非交互环境里部署时，需要确保已经提供：

```bash
CLOUDFLARE_API_TOKEN=your_token
```

例如：

```bash
CLOUDFLARE_API_TOKEN=your_token npm run deploy
```

---

## 登录说明

如果配置了：

- `LOGIN_PASSWORD`

则访问首页时会先进入登录页。

如果未配置，则默认不启用登录保护。

---

## Cron 配置

当前默认包含两条计划任务：

```toml
[triggers]
crons = ["0 0 * * *", "0 9 * * *"]
```

含义（按北京时间 / Asia/Shanghai 解释业务时间）：

- `0 0 * * *`：每天北京时间 0 点重置当日账单卡为未还款
- `0 9 * * *`：每天北京时间 9 点执行提醒检查

> 注意：Cloudflare Cron 表达式本身按 UTC 触发，但 CardDay 内部会统一按 `Asia/Shanghai` 处理业务日期、当日判断、提醒天数和定时任务逻辑。
> 也就是说，这套系统的“今天”“账单日”“到期前几天”都以北京时间为准。

---

## 页面能力说明

### 卡片列表页

支持：

- 搜索银行 / 卡片名称 / 卡号尾号
- 按银行筛选
- 按状态快速筛选
- 按以下字段排序：
  - 银行
  - 账单日
  - 还款日
  - 免息期
- 点击状态标签直接切换还款状态

### 新增 / 编辑卡片

可配置：

- 银行
- 卡片名称
- 尾号
- 账单日
- 还款规则
- 是否下期入账
- 是否已还款

### 银行管理

支持：

- 新增银行
- 编辑银行名称/图标
- 删除未关联卡片的银行

### 提醒设置

支持：

- 开关提醒
- 配置提前提醒天数
- 配置企业微信发送参数
- 配置代理地址
- 查看当前发送状态
- 发送测试消息
- 立即试发当前提醒检查

---

## API 一览

### 卡片

#### `GET /api/cards`
获取卡片列表。

#### `POST /api/cards`
新增卡片。

#### `PUT /api/cards/:id`
更新卡片。

#### `DELETE /api/cards/:id`
删除卡片。

#### `POST /api/toggle-repaid`
切换还款状态。

请求体示例：

```json
{
  "cardId": 1,
  "repaid": true
}
```

### 银行

#### `GET /api/banks`
获取银行列表。

#### `POST /api/banks`
新增银行。

#### `PUT /api/banks/:id`
更新银行。

#### `DELETE /api/banks/:id`
删除银行。

### 提醒设置

#### `GET /api/reminder-settings`
获取提醒设置与当前通道状态。

#### `PUT /api/reminder-settings`
更新提醒设置。

#### `POST /api/reminder-settings/test-message`
发送测试消息。

#### `POST /api/reminder-settings/test`
立即执行一次提醒检查。

---

## 数据存储说明

提醒相关配置支持两种来源：

### 1. 页面配置（D1）
用户在后台页面里保存的设置会进入 `app_settings`。

### 2. Worker 环境变量
如果某项页面里未配置，则会回退到环境变量。

当前提醒逻辑的优先级大致是：

1. 页面保存值
2. Worker 环境变量
3. 默认值（仅部分字段）

这样做的好处是：

- 初次部署时可以先靠环境变量跑起来
- 后续可以直接在页面里修改提醒参数，不必每次重新发版

---

## 开发说明

### 入口文件

Worker 入口：

```toml
main = "src/index.js"
```

### 页面实现方式

当前页面模板都在：

- `src/templates/dashboard.js`
- `src/templates/login.js`

采用原生模板字符串拼装，不依赖构建型前端框架。

### 提醒逻辑

提醒相关核心逻辑在：

- `src/lib/reminder.js`

包括：

- 通道状态判断
- 代理/直连发送逻辑
- 缺失参数判断
- 定时提醒检查

---

## 已实现能力（相对早期版本补充）

和最早版本相比，目前已经补上：

- 卡片新增 / 编辑 / 删除
- 银行管理界面
- 提醒设置界面
- 企业微信测试发送
- 代理模式支持
- 发送状态展示
- dashboard 搜索 / 筛选 / 排序
- 登录页支持
- UI 整体重构与压缩布局优化

---

## 后续可继续增强的方向

### 功能层

- 批量标记已还款
- 卡片分组 / 标签
- 账单统计分析
- 提醒发送失败告警
- 导入 / 导出卡片数据

### 工程层

- 增加测试
- 增加 lint / format
- 增加部署前自检
- 增加更明确的日志与错误追踪

### 体验层

- 列表列宽自适应进一步优化
- 空状态 / 加载状态精修
- 移动端交互进一步收敛

---

## License

MIT
