function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function renderLoginPage(message = '') {
  const safeMessage = message ? '<div class="error">' + escapeHtml(message) + '</div>' : ''
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>信用卡账单管家</title>
  <style>
    :root {
      --bg1: #eff6ff;
      --bg2: #f8fafc;
      --card: rgba(255,255,255,.95);
      --text: #0f172a;
      --muted: #64748b;
      --border: #dbe4f0;
      --primary: #2563eb;
      --danger-bg: #fef2f2;
      --danger-text: #b91c1c;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(180deg, var(--bg1), var(--bg2));
      display: grid;
      place-items: center;
      padding: 20px;
      color: var(--text);
    }
    .card {
      width: min(420px, 100%);
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 24px 60px rgba(15,23,42,.12);
    }
    .eyebrow { margin: 0 0 8px; font-size: 13px; color: var(--primary); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    h1 { margin: 0 0 10px; font-size: 30px; }
    p { margin: 0 0 18px; color: var(--muted); line-height: 1.7; }
    label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 700; }
    input {
      width: 100%;
      padding: 14px 16px;
      border-radius: 14px;
      border: 1px solid var(--border);
      font-size: 16px;
      outline: none;
      margin-bottom: 14px;
      background: #fff;
    }
    input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(37,99,235,.12); }
    button {
      width: 100%;
      padding: 14px 16px;
      border: none;
      border-radius: 14px;
      background: var(--primary);
      color: #fff;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
    }
    .error {
      margin-bottom: 14px;
      padding: 12px 14px;
      border-radius: 14px;
      background: var(--danger-bg);
      color: var(--danger-text);
      font-size: 14px;
    }
    .hint { margin-top: 14px; font-size: 13px; }
  </style>
</head>
<body>
  <form class="card" method="post" action="/login">
    <p class="eyebrow">信用卡账单管家</p>
    <h1>欢迎回来</h1>
    <p>登录后继续管理你的账单与还款安排。</p>
    ${safeMessage}
    <label for="password">密码</label>
    <input id="password" name="password" type="password" autocomplete="current-password" placeholder="请输入密码" required />
    <button type="submit">登录</button>
    <div class="hint">当前设备可保持登录状态，方便下次继续使用。</div>
  </form>
</body>
</html>`
}
