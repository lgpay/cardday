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
      --bg: #eef4ff;
      --bg-deep: #e5eeff;
      --card: rgba(255,255,255,0.88);
      --text: #0f172a;
      --muted: #5f7088;
      --border: rgba(148, 163, 184, 0.2);
      --primary: #2563eb;
      --primary-strong: #1d4ed8;
      --shadow: 0 22px 56px rgba(15, 23, 42, 0.09);
      --shadow-glow: 0 16px 32px rgba(37, 99, 235, 0.12);
      --danger-bg: #fee2e2;
      --danger-text: #b91c1c;
      --radius: 24px;
    }
    * { box-sizing: border-box; }
    html, body { min-height: 100%; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.16), transparent 26%),
        radial-gradient(circle at 100% 0%, rgba(14, 165, 233, 0.14), transparent 24%),
        radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.10), transparent 28%),
        linear-gradient(180deg, #f8fbff 0%, var(--bg) 52%, var(--bg-deep) 100%);
      display: grid;
      place-items: center;
      padding: 20px;
    }
    .card {
      width: min(460px, 100%);
      background: var(--card);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255,255,255,0.76);
      border-radius: var(--radius);
      padding: 30px;
      box-shadow: var(--shadow);
    }
    .eyebrow {
      margin: 0 0 8px;
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--primary);
      font-weight: 900;
    }
    h1 {
      margin: 0;
      font-size: 34px;
      line-height: 1.05;
      letter-spacing: -0.03em;
    }
    p {
      margin: 14px 0 0;
      color: var(--muted);
      line-height: 1.8;
      font-size: 15px;
    }
    .form {
      margin-top: 22px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 800;
      color: var(--text);
    }
    input {
      width: 100%;
      min-height: 48px;
      padding: 12px 14px;
      border-radius: 14px;
      border: 1px solid rgba(148,163,184,0.24);
      background: rgba(255,255,255,0.92);
      color: var(--text);
      font: inherit;
      outline: none;
      transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
    }
    input:hover {
      border-color: rgba(148,163,184,0.38);
      background: rgba(255,255,255,0.98);
    }
    input:focus {
      border-color: rgba(37,99,235,0.56);
      box-shadow: 0 0 0 4px rgba(37,99,235,0.12), 0 12px 30px rgba(37,99,235,0.08);
    }
    button {
      width: 100%;
      margin-top: 16px;
      min-height: 48px;
      border: none;
      border-radius: 14px;
      background: linear-gradient(180deg, var(--primary) 0%, var(--primary-strong) 100%);
      color: #fff;
      font: inherit;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: var(--shadow-glow);
      transition: transform .18s ease, box-shadow .18s ease;
    }
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 18px 34px rgba(37,99,235,0.18);
    }
    .error {
      margin-top: 16px;
      padding: 12px 14px;
      border-radius: 14px;
      background: var(--danger-bg);
      color: var(--danger-text);
      font-size: 14px;
    }
    .hint {
      margin-top: 14px;
      font-size: 13px;
      color: var(--muted);
    }
    @media (max-width: 640px) {
      .card { padding: 22px 18px; }
      h1 { font-size: 28px; }
      p { font-size: 14px; }
    }
  </style>
</head>
<body>
  <form class="card form" method="post" action="/login">
    <p class="eyebrow">信用卡账单管家</p>
    <h1>欢迎回来</h1>
    <p>登录后继续查看账单、还款安排与通知设置。</p>
    ${safeMessage}
    <label for="password">登录密码</label>
    <input id="password" name="password" type="password" autocomplete="current-password" placeholder="请输入登录密码" required />
    <button type="submit">进入工作台</button>
    <div class="hint">当前设备可保持登录状态，方便下次继续使用。</div>
  </form>
</body>
</html>`
}
