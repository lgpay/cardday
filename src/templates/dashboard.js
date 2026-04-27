export function renderDashboard(cardInfo) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CardDay</title>
  <style>
    :root {
      --bg: #f5f7fb;
      --card: #ffffff;
      --text: #111827;
      --muted: #6b7280;
      --border: #e5e7eb;
      --primary: #2563eb;
      --ok-bg: #dcfce7;
      --ok-text: #166534;
      --warn-bg: #fef3c7;
      --warn-text: #b45309;
      --danger-bg: #fee2e2;
      --danger-text: #b91c1c;
      --shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Arial, sans-serif;
      background: linear-gradient(180deg, #f8fbff 0%, var(--bg) 100%);
      color: var(--text);
    }

    .wrap {
      max-width: 1100px;
      margin: 0 auto;
      padding: 28px 16px 40px;
    }

    .hero, .table-wrap {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      box-shadow: var(--shadow);
    }

    .hero {
      padding: 24px;
      margin-bottom: 18px;
    }

    .eyebrow {
      margin: 0 0 8px;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--primary);
      font-weight: 700;
    }

    h1 {
      margin: 0;
      font-size: 32px;
      line-height: 1.1;
    }

    .subtitle {
      margin: 12px 0 0;
      color: var(--muted);
      line-height: 1.7;
      max-width: 720px;
    }

    .table-wrap {
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    th, td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      text-align: left;
      vertical-align: middle;
    }

    th {
      background: #f8fafc;
      color: #374151;
      font-size: 14px;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .muted { color: var(--muted); }
    .code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 13px;
      color: #1d4ed8;
    }

    .badge {
      display: inline-block;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
    }

    .ok { background: var(--ok-bg); color: var(--ok-text); }
    .warn { background: var(--warn-bg); color: var(--warn-text); }
    .danger { background: var(--danger-bg); color: var(--danger-text); }
    .idle { background: #eef2f7; color: #475569; }

    .empty {
      padding: 48px 20px;
      text-align: center;
      color: var(--muted);
    }

    @media (max-width: 760px) {
      .wrap { padding: 18px 12px 28px; }
      .hero { padding: 18px; }
      h1 { font-size: 26px; }
      table, thead, tbody, th, td, tr { display: block; }
      thead { display: none; }
      tr { padding: 14px; border-bottom: 1px solid var(--border); }
      td {
        padding: 8px 0;
        border-bottom: none;
      }
      td::before {
        content: attr(data-label);
        display: block;
        font-size: 12px;
        color: var(--muted);
        margin-bottom: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <p class="eyebrow">CardDay</p>
      <h1>信用卡账单看板</h1>
      <p class="subtitle">查看当前卡片的还款状态、预计还款日与免息期。当前版本以只读看板为主，后续会继续补管理操作。</p>
    </section>

    <section class="table-wrap">
      ${cardInfo.length ? `
      <table>
        <thead>
          <tr>
            <th>银行</th>
            <th>卡片</th>
            <th>账单日</th>
            <th>还款日</th>
            <th>免息期</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          ${cardInfo.map((card) => `
            <tr>
              <td data-label="银行">${card.bankName}</td>
              <td data-label="卡片"><span class="code">尾号 ${String(card.cardNumber).slice(-4)}</span> ${card.cardName}</td>
              <td data-label="账单日">${card.billingDay}</td>
              <td data-label="还款日">${card.repaymentDateText}</td>
              <td data-label="免息期">${card.gracePeriod} 天</td>
              <td data-label="状态">
                <span class="badge ${card.repaid ? 'ok' : card.daysToRepayment < 0 ? 'danger' : card.daysToRepayment <= 3 ? 'warn' : 'idle'}">
                  ${card.repaid ? '已还款' : card.daysToRepayment < 0 ? `逾期 ${Math.abs(card.daysToRepayment)} 天` : card.daysToRepayment === 0 ? '今天到期' : `${card.daysToRepayment} 天后到期`}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : `<div class="empty">暂无信用卡数据</div>`}
    </section>
  </div>
</body>
</html>`
}
