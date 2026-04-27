export function renderDashboard(cardInfo) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CardDay</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f7fb; color: #111827; }
    h1 { margin-bottom: 8px; }
    p { color: #6b7280; }
    table { width: 100%; border-collapse: collapse; background: white; margin-top: 20px; box-shadow: 0 8px 24px rgba(15,23,42,.08); }
    th, td { padding: 12px; border: 1px solid #eef2f7; text-align: left; }
    th { background: #f8fafc; }
    .muted { color: #6b7280; }
    .ok { color: #166534; font-weight: 700; }
    .warn { color: #b45309; font-weight: 700; }
    .danger { color: #b91c1c; font-weight: 700; }
    .code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  </style>
</head>
<body>
  <h1>CardDay</h1>
  <p>源码化重构进行中，当前先保留可用看板。</p>
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
          <td>${card.bankName}</td>
          <td><span class="code">尾号 ${String(card.cardNumber).slice(-4)}</span> ${card.cardName}</td>
          <td>${card.billingDay}</td>
          <td>${card.repaymentDateText}</td>
          <td>${card.gracePeriod} 天</td>
          <td class="${card.repaid ? 'ok' : card.daysToRepayment < 0 ? 'danger' : card.daysToRepayment <= 3 ? 'warn' : 'muted'}">
            ${card.repaid ? '已还款' : card.daysToRepayment < 0 ? `逾期 ${Math.abs(card.daysToRepayment)} 天` : card.daysToRepayment === 0 ? '今天到期' : `${card.daysToRepayment} 天后到期`}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`
}
