export function renderDashboard() {
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

    .table-wrap { overflow: hidden; }
    table { width: 100%; border-collapse: collapse; background: white; }
    th, td { padding: 14px 16px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: middle; }
    th { background: #f8fafc; color: #374151; font-size: 14px; }
    tr:last-child td { border-bottom: none; }
    .code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; color: #1d4ed8; }
    .badge { display: inline-block; padding: 6px 10px; border-radius: 999px; font-size: 13px; font-weight: 700; white-space: nowrap; }
    .ok { background: var(--ok-bg); color: var(--ok-text); }
    .warn { background: var(--warn-bg); color: var(--warn-text); }
    .danger { background: var(--danger-bg); color: var(--danger-text); }
    .idle { background: #eef2f7; color: #475569; }
    .empty, .loading { padding: 48px 20px; text-align: center; color: var(--muted); }
    .status-btn { border: none; cursor: pointer; transition: transform .18s ease, opacity .18s ease; }
    .status-btn:hover { transform: translateY(-1px); opacity: .92; }
    .status-btn:disabled { cursor: wait; opacity: .6; }
    .toast {
      position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
      background: rgba(17, 24, 39, 0.95); color: #fff; padding: 12px 16px;
      border-radius: 12px; box-shadow: var(--shadow); opacity: 0; pointer-events: none;
      transition: opacity .2s ease, transform .2s ease;
    }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(4px); }

    @media (max-width: 760px) {
      .wrap { padding: 18px 12px 28px; }
      .hero { padding: 18px; }
      h1 { font-size: 26px; }
      table, thead, tbody, th, td, tr { display: block; }
      thead { display: none; }
      tr { padding: 14px; border-bottom: 1px solid var(--border); }
      td { padding: 8px 0; border-bottom: none; }
      td::before { content: attr(data-label); display: block; font-size: 12px; color: var(--muted); margin-bottom: 4px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <p class="eyebrow">CardDay</p>
      <h1>信用卡账单看板</h1>
      <p class="subtitle">当前支持 API 拉取卡片列表与切换还款状态。后续再补卡片录入与筛选能力。</p>
    </section>

    <section class="table-wrap">
      <div id="loading" class="loading">加载中...</div>
      <div id="content"></div>
    </section>
  </div>
  <div id="toast" class="toast"></div>

  <script>
    const contentEl = document.getElementById('content');
    const loadingEl = document.getElementById('loading');
    const toastEl = document.getElementById('toast');

    function showToast(message) {
      toastEl.textContent = message;
      toastEl.classList.add('show');
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
    }

    function getStatusClass(card) {
      if (card.repaid) return 'ok';
      if (card.daysToRepayment < 0) return 'danger';
      if (card.daysToRepayment <= 3) return 'warn';
      return 'idle';
    }

    function getStatusText(card) {
      if (card.repaid) return '已还款';
      if (card.daysToRepayment < 0) return '逾期 ' + Math.abs(card.daysToRepayment) + ' 天';
      if (card.daysToRepayment === 0) return '今天到期';
      return card.daysToRepayment + ' 天后到期';
    }

    async function toggleRepaid(cardId, repaid) {
      try {
        const res = await fetch('/api/toggle-repaid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId, repaid: !repaid })
        });
        if (!res.ok) throw new Error('切换状态失败');
        showToast(!repaid ? '已标记为已还款' : '已标记为未还款');
        await loadCards();
      } catch (err) {
        showToast(err.message || '操作失败');
      }
    }

    function renderTable(items) {
      if (!items.length) {
        contentEl.innerHTML = '<div class="empty">暂无信用卡数据</div>';
        return;
      }

      const rows = items.map((card) => {
        return [
          '<tr>',
          '<td data-label="银行">' + card.bankName + '</td>',
          '<td data-label="卡片"><span class="code">尾号 ' + String(card.cardNumber).slice(-4) + '</span> ' + card.cardName + '</td>',
          '<td data-label="账单日">' + card.billingDay + '</td>',
          '<td data-label="还款日">' + card.repaymentDateText + '</td>',
          '<td data-label="免息期">' + card.gracePeriod + ' 天</td>',
          '<td data-label="状态"><button class="badge status-btn ' + getStatusClass(card) + '" data-card-id="' + card.cardId + '" data-repaid="' + card.repaid + '">' + getStatusText(card) + '</button></td>',
          '</tr>'
        ].join('');
      }).join('');

      contentEl.innerHTML = [
        '<table>',
        '<thead><tr><th>银行</th><th>卡片</th><th>账单日</th><th>还款日</th><th>免息期</th><th>状态</th></tr></thead>',
        '<tbody>' + rows + '</tbody>',
        '</table>'
      ].join('');

      contentEl.querySelectorAll('.status-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          await toggleRepaid(Number(btn.dataset.cardId), btn.dataset.repaid === 'true' || btn.dataset.repaid === '1');
        });
      });
    }

    async function loadCards() {
      loadingEl.style.display = 'block';
      contentEl.innerHTML = '';
      try {
        const res = await fetch('/api/cards');
        if (!res.ok) throw new Error('加载卡片失败');
        const data = await res.json();
        renderTable(data.items || []);
      } catch (err) {
        contentEl.innerHTML = '<div class="empty">' + (err.message || '加载失败') + '</div>';
      } finally {
        loadingEl.style.display = 'none';
      }
    }

    loadCards();
  </script>
</body>
</html>`
}
