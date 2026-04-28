export function renderDashboard() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CardDay</title>
  <style>
    :root {
      --bg: #f3f7fb;
      --card: rgba(255, 255, 255, 0.92);
      --card-strong: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --primary: #2563eb;
      --primary-soft: #dbeafe;
      --ok-bg: #dcfce7;
      --ok-text: #166534;
      --warn-bg: #fef3c7;
      --warn-text: #b45309;
      --danger-bg: #fee2e2;
      --danger-text: #b91c1c;
      --idle-bg: #eef2ff;
      --idle-text: #4338ca;
      --shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
      --shadow-soft: 0 10px 24px rgba(15, 23, 42, 0.06);
      --radius: 22px;
    }

    * { box-sizing: border-box; }
    html, body { min-height: 100%; }
    body {
      margin: 0;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 28%),
        radial-gradient(circle at top right, rgba(14, 165, 233, 0.10), transparent 24%),
        linear-gradient(180deg, #f8fbff 0%, var(--bg) 100%);
      color: var(--text);
    }

    .wrap {
      max-width: 1240px;
      margin: 0 auto;
      padding: 28px 16px 40px;
    }

    .hero,
    .panel,
    .table-wrap {
      background: var(--card);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.7);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .hero {
      padding: 24px;
      margin-bottom: 18px;
      display: grid;
      grid-template-columns: 1.4fr 0.8fr;
      gap: 18px;
      align-items: start;
    }

    .eyebrow {
      margin: 0 0 8px;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--primary);
      font-weight: 800;
    }

    h1 {
      margin: 0;
      font-size: 34px;
      line-height: 1.08;
      letter-spacing: -0.02em;
    }

    .subtitle {
      margin: 12px 0 0;
      color: var(--muted);
      line-height: 1.75;
      max-width: 760px;
    }

    .meta {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      color: var(--muted);
      font-size: 14px;
    }

    .meta-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.72);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 8px 12px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .stat {
      background: rgba(255,255,255,0.72);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 16px;
      box-shadow: var(--shadow-soft);
    }

    .stat-label {
      font-size: 13px;
      color: var(--muted);
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .toolbar {
      display: grid;
      grid-template-columns: 1.6fr minmax(140px, 0.6fr) auto auto auto;
      gap: 12px;
      margin-bottom: 16px;
      align-items: center;
    }

    .panel {
      padding: 16px;
      margin-bottom: 16px;
    }

    .form-panel {
      display: none;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
    }

    .bank-panel {
      display: none;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
    }

    .modal-shell {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.38);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      z-index: 30;
    }

    .modal-shell.show {
      display: flex;
    }

    .modal-card {
      width: min(920px, 100%);
      max-height: min(88vh, 920px);
      overflow: auto;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
      padding: 20px;
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }

    .modal-title {
      margin: 0;
      font-size: 22px;
      line-height: 1.2;
    }

    .modal-desc {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.6;
    }

    .icon-btn {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: #fff;
      cursor: pointer;
      font-size: 18px;
      color: var(--muted);
    }

    .icon-btn:hover {
      background: #f8fafc;
    }

    .modal-body > .form-panel,
    .modal-body > .bank-panel {
      display: block;
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

    .form-panel.show,
    .bank-panel.show {
      display: block;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }

    .field-group label {
      display: block;
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 6px;
    }

    .field-error {
      margin-top: 6px;
      color: #b91c1c;
      font-size: 12px;
      min-height: 16px;
    }

    .field.invalid {
      border-color: #fca5a5;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.10);
    }

    .tip-box {
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid var(--border);
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }

    .field-group.full {
      grid-column: span 2;
    }

    .switch-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 12px;
      color: var(--muted);
      font-size: 14px;
    }

    .switch-row label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .actions-row {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 14px;
    }

    .table-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .bank-list {
      margin-top: 14px;
      display: grid;
      gap: 10px;
    }

    .bank-item {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px 14px;
      background: #fff;
    }

    .bank-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .mini-btn {
      border: 1px solid var(--border);
      background: #fff;
      color: var(--text);
      border-radius: 10px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .mini-btn:hover {
      background: #f8fafc;
    }

    .mini-btn.danger-text {
      color: #b91c1c;
      border-color: #fecaca;
      background: #fff5f5;
    }

    .field,
    .button {
      width: 100%;
      height: 44px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,0.9);
      color: var(--text);
      font-size: 14px;
      padding: 0 14px;
      outline: none;
      transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
    }

    .field:focus,
    .button:focus {
      border-color: rgba(37,99,235,0.5);
      box-shadow: 0 0 0 4px rgba(37,99,235,0.12);
    }

    .button {
      cursor: pointer;
      background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
      color: #fff;
      font-weight: 700;
      border: none;
      box-shadow: 0 10px 18px rgba(37,99,235,0.24);
    }

    .button:hover { transform: translateY(-1px); }
    .button.secondary {
      background: rgba(255,255,255,0.92);
      color: var(--text);
      border: 1px solid var(--border);
      box-shadow: none;
    }

    .helper-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      margin-top: 8px;
      color: var(--muted);
      font-size: 13px;
      flex-wrap: wrap;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .legend .badge {
      cursor: pointer;
      border: 1px solid transparent;
      transition: transform .16s ease, box-shadow .16s ease, opacity .16s ease, border-color .16s ease;
    }

    .legend .badge:hover {
      transform: translateY(-1px);
      opacity: .95;
    }

    .legend .badge.active {
      border-color: rgba(15, 23, 42, 0.12);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
    }

    .table-wrap {
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card-strong);
    }

    th, td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      text-align: left;
      vertical-align: middle;
    }

    th {
      background: #f8fafc;
      color: #334155;
      font-size: 13px;
      letter-spacing: 0.02em;
      font-weight: 800;
      white-space: nowrap;
    }

    .sortable-th {
      cursor: pointer;
      user-select: none;
      transition: background-color .16s ease, color .16s ease;
    }

    .sortable-th:hover {
      background: #eef4ff;
      color: #1d4ed8;
    }

    .sort-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .sort-arrow {
      font-size: 11px;
      color: #94a3b8;
    }

    tbody tr { transition: background-color .16s ease; }
    tbody tr:hover { background: #f8fbff; }
    tr:last-child td { border-bottom: none; }

    .bank-cell,
    .card-main {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .bank-icon {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      object-fit: cover;
      background: #fff;
      border: 1px solid var(--border);
      flex: 0 0 auto;
    }

    .bank-fallback {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-soft);
      color: var(--primary);
      font-size: 12px;
      font-weight: 800;
      border: 1px solid #bfdbfe;
      flex: 0 0 auto;
    }

    .bank-name,
    .card-title {
      font-weight: 700;
      line-height: 1.35;
    }

    .muted,
    .subtext {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }

    .code {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      color: #1d4ed8;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 5px 8px;
      border-radius: 999px;
      margin-top: 4px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 7px 11px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 800;
      white-space: nowrap;
      border: none;
    }

    .ok { background: var(--ok-bg); color: var(--ok-text); }
    .warn { background: var(--warn-bg); color: var(--warn-text); }
    .danger { background: var(--danger-bg); color: var(--danger-text); }
    .idle { background: var(--idle-bg); color: var(--idle-text); }

    .status-btn {
      cursor: pointer;
      transition: transform .18s ease, opacity .18s ease, box-shadow .18s ease;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.25);
    }

    .status-btn:hover { transform: translateY(-1px); opacity: .96; }
    .status-btn:disabled { cursor: wait; opacity: .65; }

    .pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .sort-chip {
      display: none;
    }

    .empty, .loading {
      padding: 52px 20px;
      text-align: center;
      color: var(--muted);
    }

    .toast {
      position: fixed;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.96);
      color: #fff;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: var(--shadow);
      opacity: 0;
      pointer-events: none;
      transition: opacity .2s ease, transform .2s ease;
      z-index: 10;
    }

    .toast.show { opacity: 1; transform: translateX(-50%) translateY(4px); }

    @media (max-width: 1024px) {
      .hero { grid-template-columns: 1fr; }
      .toolbar { grid-template-columns: 1fr 1fr; }
      .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 760px) {
      .wrap { padding: 18px 12px 28px; }
      .hero, .panel { padding: 18px; }
      h1 { font-size: 28px; }
      .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .toolbar { grid-template-columns: 1fr; }
      .form-grid { grid-template-columns: 1fr; }
      .field-group.full { grid-column: span 1; }
      table, thead, tbody, th, td, tr { display: block; }
      thead { display: none; }
      tbody { padding: 8px; }
      tr {
        margin: 10px;
        border: 1px solid var(--border);
        border-radius: 18px;
        background: #fff;
        box-shadow: var(--shadow-soft);
        overflow: hidden;
      }
      td {
        padding: 10px 14px;
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
      <div>
        <p class="eyebrow">CardDay</p>
        <h1>信用卡账单看板</h1>
        <p class="subtitle">把卡片、还款日、免息期和当前状态放到一页里。支持搜索、筛选、排序和一键切换已还款状态。</p>
        <div class="meta">
          <span class="meta-chip">📌 账单总览</span>
          <span class="meta-chip">⚡ 线上实时数据</span>
          <span class="meta-chip" id="lastUpdatedChip">🕒 等待加载</span>
        </div>
      </div>
      <div class="summary-grid" id="summaryGrid">
        <div class="stat"><div class="stat-label">总卡片</div><div class="stat-value">--</div></div>
        <div class="stat"><div class="stat-label">待还款</div><div class="stat-value">--</div></div>
        <div class="stat"><div class="stat-label">3 天内到期</div><div class="stat-value">--</div></div>
        <div class="stat"><div class="stat-label">已逾期</div><div class="stat-value">--</div></div>
      </div>
    </section>

    <section class="panel">
      <div class="toolbar">
        <input id="searchInput" class="field" type="search" placeholder="搜索银行 / 卡片名称 / 卡号尾号" />
        <select id="bankFilter" class="field">
          <option value="all">全部银行</option>
        </select>
        <button id="manageBanksBtn" class="button secondary" type="button">银行管理</button>
        <button id="newCardBtn" class="button secondary" type="button">新增卡片</button>
        <button id="refreshBtn" class="button" type="button">刷新数据</button>
      </div>
      <div class="helper-row">
        <div class="legend">
          <button class="badge ok js-quick-filter" data-filter="repaid" type="button">已还款</button>
          <button class="badge warn js-quick-filter" data-filter="dueSoon" type="button">3 天内到期</button>
          <button class="badge danger js-quick-filter" data-filter="overdue" type="button">已逾期</button>
          <button class="badge idle js-quick-filter" data-filter="unexpired" type="button">未到期</button>
        </div>
        <div id="resultHint">准备加载数据…</div>
      </div>

      <div id="formPanel" class="form-panel">
        <div class="form-grid">
          <div class="field-group full">
            <label for="cardNameInput">卡片名称</label>
            <input id="cardNameInput" class="field" type="text" placeholder="比如：悠悦白" />
            <div id="cardNameError" class="field-error"></div>
          </div>
          <div class="field-group">
            <label for="bankSelect">银行</label>
            <select id="bankSelect" class="field"><option value="">选择银行</option></select>
            <div id="bankSelectError" class="field-error"></div>
          </div>
          <div class="field-group">
            <label for="cardNumberInput">尾号（非必填）</label>
            <input id="cardNumberInput" class="field" type="text" placeholder="如 8203" maxlength="16" inputmode="numeric" />
            <div id="cardNumberError" class="field-error"></div>
          </div>
          <div class="field-group">
            <label for="billingDayInput">账单日</label>
            <input id="billingDayInput" class="field" type="number" min="1" max="28" placeholder="1-28" />
            <div id="billingDayError" class="field-error"></div>
          </div>
          <div class="field-group">
            <label for="ruleTypeSelect">还款规则</label>
            <select id="ruleTypeSelect" class="field">
              <option value="repaymentDay">固定还款日</option>
              <option value="graceDays">账单日后 N 天</option>
            </select>
            <div class="field-error"></div>
          </div>
          <div class="field-group">
            <label for="repaymentDayInput">还款日</label>
            <input id="repaymentDayInput" class="field" type="number" min="1" max="28" placeholder="1-28" />
            <div id="repaymentDayError" class="field-error"></div>
          </div>
          <div class="field-group">
            <label for="graceDaysInput">账单后天数</label>
            <input id="graceDaysInput" class="field" type="number" min="1" max="99" placeholder="如 20" disabled />
            <div id="graceDaysError" class="field-error"></div>
          </div>
        </div>
        <div class="tip-box" id="cardRuleTip">固定还款日模式：填写每月还款日。</div>
        <div class="switch-row">
          <label><input id="isNextPeriodInput" type="checkbox" /> 下个账期生效</label>
          <label><input id="repaidInput" type="checkbox" /> 标记为已还款</label>
        </div>
        <div class="actions-row">
          <button id="cancelCardBtn" class="button secondary" type="button">取消</button>
          <button id="saveCardBtn" class="button" type="button">保存卡片</button>
        </div>
      </div>

      <div id="bankPanel" class="bank-panel">
        <div class="form-grid">
          <div class="field-group">
            <label for="bankNameInput">银行名称</label>
            <input id="bankNameInput" class="field" type="text" placeholder="比如：工商银行" />
            <div id="bankNameError" class="field-error"></div>
          </div>
          <div class="field-group full">
            <label for="bankIconUrlInput">图标地址（非必填）</label>
            <input id="bankIconUrlInput" class="field" type="text" placeholder="https://.../logo.png" />
            <div id="bankIconUrlError" class="field-error"></div>
          </div>
        </div>
        <div class="actions-row">
          <button id="cancelBankBtn" class="button secondary" type="button">取消</button>
          <button id="saveBankBtn" class="button" type="button">保存银行</button>
        </div>
        <div id="bankList" class="bank-list"></div>
      </div>
    </section>

    <section class="table-wrap">
      <div id="loading" class="loading">加载中...</div>
      <div id="content"></div>
    </section>
  </div>

  <div id="modalShell" class="modal-shell" aria-hidden="true">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2 id="modalTitle" class="modal-title">编辑</h2>
          <p id="modalDesc" class="modal-desc">在这里集中完成录入和修改。</p>
        </div>
        <button id="closeModalBtn" class="icon-btn" type="button" aria-label="关闭">×</button>
      </div>
      <div id="modalBody" class="modal-body"></div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    const contentEl = document.getElementById('content');
    const loadingEl = document.getElementById('loading');
    const toastEl = document.getElementById('toast');
    const searchInput = document.getElementById('searchInput');
    const bankFilter = document.getElementById('bankFilter');
    const manageBanksBtn = document.getElementById('manageBanksBtn');
    const newCardBtn = document.getElementById('newCardBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const resultHint = document.getElementById('resultHint');
    const lastUpdatedChip = document.getElementById('lastUpdatedChip');
    const summaryGrid = document.getElementById('summaryGrid');
    const formPanel = document.getElementById('formPanel');
    const bankPanel = document.getElementById('bankPanel');
    const modalShell = document.getElementById('modalShell');
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const bankSelect = document.getElementById('bankSelect');
    const cardNameInput = document.getElementById('cardNameInput');
    const cardNumberInput = document.getElementById('cardNumberInput');
    const billingDayInput = document.getElementById('billingDayInput');
    const ruleTypeSelect = document.getElementById('ruleTypeSelect');
    const repaymentDayInput = document.getElementById('repaymentDayInput');
    const graceDaysInput = document.getElementById('graceDaysInput');
    const isNextPeriodInput = document.getElementById('isNextPeriodInput');
    const repaidInput = document.getElementById('repaidInput');
    const cancelCardBtn = document.getElementById('cancelCardBtn');
    const saveCardBtn = document.getElementById('saveCardBtn');
    const cardRuleTip = document.getElementById('cardRuleTip');
    const cardNameError = document.getElementById('cardNameError');
    const bankSelectError = document.getElementById('bankSelectError');
    const cardNumberError = document.getElementById('cardNumberError');
    const billingDayError = document.getElementById('billingDayError');
    const repaymentDayError = document.getElementById('repaymentDayError');
    const graceDaysError = document.getElementById('graceDaysError');
    const bankNameInput = document.getElementById('bankNameInput');
    const bankIconUrlInput = document.getElementById('bankIconUrlInput');
    const bankNameError = document.getElementById('bankNameError');
    const bankIconUrlError = document.getElementById('bankIconUrlError');
    const cancelBankBtn = document.getElementById('cancelBankBtn');
    const saveBankBtn = document.getElementById('saveBankBtn');
    const bankList = document.getElementById('bankList');

    let allItems = [];
    let filteredItems = [];
    let lastMeta = null;
    let currentSort = 'daysToRepaymentAsc';
    let currentStatusFilter = 'all';
    let banksCache = [];
    let editingCardId = null;
    let editingBankId = null;

    function showToast(message) {
      toastEl.textContent = message;
      toastEl.classList.add('show');
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
    }

    function openModal(title, desc, panelEl) {
      modalTitle.textContent = title;
      modalDesc.textContent = desc;
      formPanel.classList.remove('show');
      bankPanel.classList.remove('show');
      panelEl.classList.add('show');
      modalBody.innerHTML = '';
      modalBody.appendChild(panelEl);
      modalShell.classList.add('show');
      modalShell.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modalShell.classList.remove('show');
      modalShell.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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

    function formatLocalDate(isoText) {
      if (!isoText) return '未知';
      const d = new Date(isoText);
      if (Number.isNaN(d.getTime())) return isoText;
      return d.toLocaleString('zh-CN', { hour12: false });
    }

    function getBankInitial(name) {
      return String(name || '卡').slice(0, 1);
    }

    function cardSearchText(card) {
      return [
        card.bankName,
        card.cardName,
        card.cardNumber,
        card.cardNumberLast4,
        card.repaymentDateText
      ].join(' ').toLowerCase();
    }

    function fillBankFilter(items) {
      const banks = Array.from(new Set(items.map(item => item.bankName).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh-CN'));
      const current = bankFilter.value;
      bankFilter.innerHTML = '<option value="all">全部银行</option>' + banks.map(name => '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>').join('');
      if (banks.includes(current)) bankFilter.value = current;
    }

    function fillBankOptions(items) {
      banksCache = Array.isArray(items) ? items : [];
      bankSelect.innerHTML = '<option value="">选择银行</option>' + banksCache.map(item => '<option value="' + item.bank_id + '">' + escapeHtml(item.bank_name) + '</option>').join('');
      renderBankList();
    }

    function updateSummary(items) {
      const total = items.length;
      const repaid = items.filter(item => item.repaid).length;
      const unpaid = total - repaid;
      const dueSoon = items.filter(item => !item.repaid && item.daysToRepayment >= 0 && item.daysToRepayment <= 3).length;
      const overdue = items.filter(item => !item.repaid && item.daysToRepayment < 0).length;
      summaryGrid.innerHTML = [
        ['总卡片', total],
        ['待还款', unpaid],
        ['3 天内到期', dueSoon],
        ['已逾期', overdue]
      ].map(([label, value]) => '<div class="stat"><div class="stat-label">' + label + '</div><div class="stat-value">' + value + '</div></div>').join('');
    }

    function applyFilters() {
      const q = searchInput.value.trim().toLowerCase();
      const status = currentStatusFilter;
      const bank = bankFilter.value;
      let items = allItems.filter(card => {
        if (q && !cardSearchText(card).includes(q)) return false;
        if (bank !== 'all' && card.bankName !== bank) return false;
        if (status === 'repaid' && !card.repaid) return false;
        if (status === 'unpaid' && card.repaid) return false;
        if (status === 'dueSoon' && (card.repaid || card.daysToRepayment < 0 || card.daysToRepayment > 3)) return false;
        if (status === 'overdue' && (card.repaid || card.daysToRepayment >= 0)) return false;
        if (status === 'unexpired' && (card.repaid || card.daysToRepayment < 0)) return false;
        return true;
      });

      const sorter = currentSort;
      items.sort((a, b) => {
        if (sorter === 'billingDayAsc') return a.billingDay - b.billingDay || a.cardId - b.cardId;
        if (sorter === 'billingDayDesc') return b.billingDay - a.billingDay || a.cardId - b.cardId;
        if (sorter === 'gracePeriodAsc') return a.gracePeriod - b.gracePeriod || a.cardId - b.cardId;
        if (sorter === 'gracePeriodDesc') return b.gracePeriod - a.gracePeriod || a.cardId - b.cardId;
        if (sorter === 'bankNameAsc') return String(a.bankName).localeCompare(String(b.bankName), 'zh-CN') || a.cardId - b.cardId;
        if (sorter === 'bankNameDesc') return String(b.bankName).localeCompare(String(a.bankName), 'zh-CN') || a.cardId - b.cardId;
        if (sorter === 'daysToRepaymentDesc') return b.daysToRepayment - a.daysToRepayment || Number(a.repaid) - Number(b.repaid) || a.cardId - b.cardId;
        return a.daysToRepayment - b.daysToRepayment || Number(a.repaid) - Number(b.repaid) || a.cardId - b.cardId;
      });

      filteredItems = items;
      updateSummary(filteredItems);
      resultHint.textContent = '当前显示 ' + filteredItems.length + ' / ' + allItems.length + ' 张卡';
      renderTable(filteredItems);
    }

    function toggleSort(field) {
      const current = currentSort;
      const pairs = {
        daysToRepayment: ['daysToRepaymentAsc', 'daysToRepaymentDesc'],
        billingDay: ['billingDayAsc', 'billingDayDesc'],
        gracePeriod: ['gracePeriodAsc', 'gracePeriodDesc'],
        bankName: ['bankNameAsc', 'bankNameDesc']
      };
      const [asc, desc] = pairs[field] || [];
      if (!asc) return;
      currentSort = current === asc ? desc : asc;
      applyFilters();
    }

    function getSortArrow(field) {
      const current = currentSort;
      if (current === field + 'Asc') return '↑';
      if (current === field + 'Desc') return '↓';
      return '↕';
    }

    function clearError(inputEl, errorEl) {
      if (inputEl) inputEl.classList.remove('invalid');
      if (errorEl) errorEl.textContent = '';
    }

    function setError(inputEl, errorEl, message) {
      if (inputEl) inputEl.classList.add('invalid');
      if (errorEl) errorEl.textContent = message;
    }

    function sanitizeDigitsInput(inputEl, maxLength = 16) {
      inputEl.value = String(inputEl.value || '').replace(/\D+/g, '').slice(0, maxLength);
    }

    function validateCardForm() {
      [
        [cardNameInput, cardNameError],
        [bankSelect, bankSelectError],
        [cardNumberInput, cardNumberError],
        [billingDayInput, billingDayError],
        [repaymentDayInput, repaymentDayError],
        [graceDaysInput, graceDaysError]
      ].forEach(([inputEl, errorEl]) => clearError(inputEl, errorEl));

      let ok = true;
      if (!cardNameInput.value.trim()) {
        setError(cardNameInput, cardNameError, '请填写卡片名称');
        ok = false;
      }
      if (!bankSelect.value) {
        setError(bankSelect, bankSelectError, '请选择银行');
        ok = false;
      }
      if (!billingDayInput.value || Number(billingDayInput.value) < 1 || Number(billingDayInput.value) > 28) {
        setError(billingDayInput, billingDayError, '账单日需在 1-28 之间');
        ok = false;
      }
      if (cardNumberInput.value && !/^\d{1,16}$/.test(cardNumberInput.value)) {
        setError(cardNumberInput, cardNumberError, '尾号只能是 1-16 位数字');
        ok = false;
      }
      if (ruleTypeSelect.value === 'graceDays') {
        if (!graceDaysInput.value || Number(graceDaysInput.value) < 1 || Number(graceDaysInput.value) > 99) {
          setError(graceDaysInput, graceDaysError, '账单后天数需在 1-99 之间');
          ok = false;
        }
      } else {
        if (!repaymentDayInput.value || Number(repaymentDayInput.value) < 1 || Number(repaymentDayInput.value) > 28) {
          setError(repaymentDayInput, repaymentDayError, '还款日需在 1-28 之间');
          ok = false;
        }
      }
      return ok;
    }

    function validateBankForm() {
      clearError(bankNameInput, bankNameError);
      clearError(bankIconUrlInput, bankIconUrlError);
      let ok = true;
      if (!bankNameInput.value.trim()) {
        setError(bankNameInput, bankNameError, '请填写银行名称');
        ok = false;
      }
      const icon = bankIconUrlInput.value.trim();
      if (icon && !(icon.toLowerCase().startsWith('http://') || icon.toLowerCase().startsWith('https://'))) {
        setError(bankIconUrlInput, bankIconUrlError, '图标地址需为 http/https 链接');
        ok = false;
      }
      return ok;
    }

    function updateRuleInputs() {
      const useGraceDays = ruleTypeSelect.value === 'graceDays';
      graceDaysInput.disabled = !useGraceDays;
      repaymentDayInput.disabled = useGraceDays;
      cardRuleTip.textContent = useGraceDays
        ? '账单日后 N 天模式：填写账单日后多少天到期。'
        : '固定还款日模式：填写每月还款日。';
      if (useGraceDays) {
        repaymentDayInput.value = '';
        clearError(repaymentDayInput, repaymentDayError);
      } else {
        graceDaysInput.value = '';
        clearError(graceDaysInput, graceDaysError);
      }
    }

    function resetCardForm() {
      editingCardId = null;
      newCardBtn.textContent = '新增卡片';
      saveCardBtn.textContent = '保存卡片';
      cardNameInput.value = '';
      bankSelect.value = '';
      cardNumberInput.value = '';
      billingDayInput.value = '';
      ruleTypeSelect.value = 'repaymentDay';
      repaymentDayInput.value = '';
      graceDaysInput.value = '';
      isNextPeriodInput.checked = false;
      repaidInput.checked = false;
      updateRuleInputs();
    }

    function resetBankForm() {
      editingBankId = null;
      manageBanksBtn.textContent = '银行管理';
      saveBankBtn.textContent = '保存银行';
      bankNameInput.value = '';
      bankIconUrlInput.value = '';
    }

    function renderBankList() {
      if (!banksCache.length) {
        bankList.innerHTML = '<div class="subtext">暂无银行数据</div>';
        return;
      }
      bankList.innerHTML = banksCache.map((bank) => {
        const icon = bank.bank_icon_url
          ? '<img class="bank-icon" src="' + escapeHtml(bank.bank_icon_url) + '" alt="' + escapeHtml(bank.bank_name) + '" loading="lazy" referrerpolicy="no-referrer">'
          : '<span class="bank-fallback">' + escapeHtml(getBankInitial(bank.bank_name)) + '</span>';
        return '<div class="bank-item">'
          + '<div class="bank-meta">' + icon + '<div><div class="bank-name">' + escapeHtml(bank.bank_name) + '</div><div class="subtext">ID: ' + bank.bank_id + '</div></div></div>'
          + '<div class="table-actions">'
          + '<button class="mini-btn js-edit-bank" data-bank-id="' + bank.bank_id + '" type="button">编辑</button>'
          + '<button class="mini-btn danger-text js-delete-bank" data-bank-id="' + bank.bank_id + '" data-bank-name="' + escapeHtml(bank.bank_name) + '" type="button">删除</button>'
          + '</div></div>'
      }).join('');

      bankList.querySelectorAll('.js-edit-bank').forEach((btn) => {
        btn.addEventListener('click', () => {
          const bank = banksCache.find(item => item.bank_id === Number(btn.dataset.bankId));
          if (!bank) return;
          editingBankId = bank.bank_id;
          manageBanksBtn.textContent = '编辑银行';
          saveBankBtn.textContent = '保存修改';
          openModal('银行管理', '新增、编辑或删除银行，卡片表单会自动同步。', bankPanel);
          bankNameInput.value = bank.bank_name || '';
          bankIconUrlInput.value = bank.bank_icon_url || '';
          bankNameInput.focus();
        });
      });

      bankList.querySelectorAll('.js-delete-bank').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const ok = confirm('确认删除银行「' + (btn.dataset.bankName || '') + '」？');
          if (!ok) return;
          try {
            const res = await fetch('/api/banks/' + btn.dataset.bankId, { method: 'DELETE' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || '删除失败');
            showToast('银行已删除');
            resetBankForm();
            await loadBanks();
            await loadCards(false);
          } catch (err) {
            showToast(err.message || '删除失败');
          }
        });
      });
    }

    function openCreateForm() {
      editingCardId = null;
      newCardBtn.textContent = '新增卡片';
      saveCardBtn.textContent = '保存卡片';
      openModal('新增卡片', '集中填写卡片基础信息和还款规则。', formPanel);
      cardNameInput.focus();
    }

    function openEditForm(card) {
      editingCardId = card.cardId;
      newCardBtn.textContent = '编辑中';
      saveCardBtn.textContent = '保存修改';
      openModal('编辑卡片', '修改卡片基础信息、账单日和还款规则。', formPanel);
      cardNameInput.value = card.cardName || '';
      const bank = banksCache.find(item => item.bank_name === card.bankName);
      bankSelect.value = bank ? String(bank.bank_id) : '';
      cardNumberInput.value = card.cardNumber || '';
      billingDayInput.value = card.billingDay || '';
      const useGraceDays = card.rawGraceType === 1 || card.rawGraceType === '1' || card.rawGraceType === true;
      ruleTypeSelect.value = useGraceDays ? 'graceDays' : 'repaymentDay';
      repaymentDayInput.value = card.rawRepaymentDay || '';
      graceDaysInput.value = card.rawGraceDays || '';
      isNextPeriodInput.checked = !!card.rawIsNextPeriod;
      repaidInput.checked = !!card.repaid;
      updateRuleInputs();
      cardNameInput.focus();
    }

    async function loadBanks() {
      const res = await fetch('/api/banks', { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('加载银行失败');
      const data = await res.json();
      fillBankOptions(data.items || []);
    }

    async function saveBank() {
      if (!validateBankForm()) {
        showToast('先把银行信息填对');
        return;
      }
      const payload = {
        bankName: bankNameInput.value.trim(),
        bankIconUrl: bankIconUrlInput.value.trim()
      };
      saveBankBtn.disabled = true;
      saveBankBtn.textContent = '保存中...';
      try {
        const res = await fetch(editingBankId ? ('/api/banks/' + editingBankId) : '/api/banks', {
          method: editingBankId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || '保存失败');
        showToast(editingBankId ? '银行已更新' : '银行已新增');
        resetBankForm();
        await loadBanks();
        await loadCards(false);
        closeModal();
      } catch (err) {
        showToast(err.message || '保存失败');
      } finally {
        saveBankBtn.disabled = false;
        saveBankBtn.textContent = editingBankId ? '保存修改' : '保存银行';
      }
    }

    async function saveCard() {
      sanitizeDigitsInput(cardNumberInput, 16);
      sanitizeDigitsInput(billingDayInput, 2);
      sanitizeDigitsInput(repaymentDayInput, 2);
      sanitizeDigitsInput(graceDaysInput, 2);

      if (!validateCardForm()) {
        showToast('先把卡片信息填对');
        return;
      }

      const payload = {
        bankId: Number(bankSelect.value),
        cardName: cardNameInput.value.trim(),
        cardNumber: cardNumberInput.value.trim(),
        billingDay: Number(billingDayInput.value),
        isNextPeriod: isNextPeriodInput.checked,
        graceType: ruleTypeSelect.value === 'graceDays' ? 1 : 0,
        graceDays: graceDaysInput.value,
        repaymentDay: repaymentDayInput.value,
        repaid: repaidInput.checked
      };

      saveCardBtn.disabled = true;
      saveCardBtn.textContent = editingCardId ? '保存中...' : '保存中...';
      try {
        const res = await fetch(editingCardId ? ('/api/cards/' + editingCardId) : '/api/cards', {
          method: editingCardId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || '保存失败');
        showToast(editingCardId ? '卡片已更新' : '卡片已新增');
        formPanel.classList.remove('show');
        resetCardForm();
        await loadCards(false);
        closeModal();
      } catch (err) {
        showToast(err.message || '保存失败');
      } finally {
        saveCardBtn.disabled = false;
        saveCardBtn.textContent = editingCardId ? '保存修改' : '保存卡片';
      }
    }

    async function removeCard(cardId, cardName) {
      const ok = confirm('确认删除「' + (cardName || '这张卡') + '」？此操作不可恢复。');
      if (!ok) return;
      try {
        const res = await fetch('/api/cards/' + cardId, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || '删除失败');
        showToast('卡片已删除');
        if (editingCardId === cardId) {
          formPanel.classList.remove('show');
          resetCardForm();
        }
        await loadCards(false);
      } catch (err) {
        showToast(err.message || '删除失败');
      }
    }

    function syncQuickFilters() {
      document.querySelectorAll('.js-quick-filter').forEach((btn) => {
        const active = btn.dataset.filter === currentStatusFilter;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    function bindQuickFilters() {
      document.querySelectorAll('.js-quick-filter').forEach((btn) => {
        btn.addEventListener('click', () => {
          const next = btn.dataset.filter;
          currentStatusFilter = currentStatusFilter === next ? 'all' : next;
          syncQuickFilters();
          applyFilters();
        });
      });
    }

    async function toggleRepaid(cardId, repaid) {
      try {
        const res = await fetch('/api/toggle-repaid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId, repaid: !repaid })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || '切换状态失败');
        showToast(!repaid ? '已标记为已还款' : '已标记为未还款');
        const target = allItems.find(item => item.cardId === cardId);
        if (target) target.repaid = !repaid ? 1 : 0;
        syncQuickFilters();
        applyFilters();
      } catch (err) {
        showToast(err.message || '操作失败');
      }
    }

    function renderBankCell(card) {
      const icon = card.bankIconUrl
        ? '<img class="bank-icon js-bank-icon" src="' + escapeHtml(card.bankIconUrl) + '" alt="' + escapeHtml(card.bankName) + '" loading="lazy" referrerpolicy="no-referrer">' +
          '<span class="bank-fallback" style="display:none">' + escapeHtml(getBankInitial(card.bankName)) + '</span>'
        : '<span class="bank-fallback">' + escapeHtml(getBankInitial(card.bankName)) + '</span>';

      return '<div class="bank-cell">' + icon + '<div><div class="bank-name">' + escapeHtml(card.bankName) + '</div></div></div>';
    }

    function renderCardCell(card) {
      return '<div class="card-main"><div><div class="card-title">' + escapeHtml(card.cardName || '未命名卡片') + '</div></div></div>';
    }

    function renderCardNumberCell(card) {
      if (!card.cardNumberLast4) {
        return '<span class="subtext">未填写</span>';
      }
      return '<strong>' + escapeHtml(card.cardNumberLast4) + '</strong>';
    }

    function renderDateCell(card) {
      return '<div><div>' + escapeHtml(card.repaymentDateText) + '</div></div>';
    }

    function renderActionCell(card) {
      return '<div class="table-actions">'
        + '<button class="mini-btn js-edit-card" data-card-id="' + card.cardId + '" type="button">编辑</button>'
        + '<button class="mini-btn danger-text js-delete-card" data-card-id="' + card.cardId + '" data-card-name="' + escapeHtml(card.cardName || '') + '" type="button">删除</button>'
        + '</div>';
    }

    function renderTable(items) {
      if (!items.length) {
        contentEl.innerHTML = '<div class="empty">没有匹配的卡片，换个筛选条件试试。</div>';
        return;
      }

      const rows = items.map((card) => {
        return [
          '<tr>',
          '<td data-label="银行">' + renderBankCell(card) + '</td>',
          '<td data-label="卡片名称">' + renderCardCell(card) + '</td>',
          '<td data-label="尾号">' + renderCardNumberCell(card) + '</td>',
          '<td data-label="账单日"><strong>' + card.billingDay + '</strong></td>',
          '<td data-label="还款日">' + renderDateCell(card) + '</td>',
          '<td data-label="免息期"><div><strong>' + card.gracePeriod + ' 天</strong></div></td>',
          '<td data-label="状态"><button class="badge status-btn ' + getStatusClass(card) + '" data-card-id="' + card.cardId + '" data-repaid="' + card.repaid + '">' + escapeHtml(getStatusText(card)) + '</button></td>',
          '<td data-label="操作">' + renderActionCell(card) + '</td>',
          '</tr>'
        ].join('');
      }).join('');

      contentEl.innerHTML = [
        '<table>',
        '<thead><tr>' +
        '<th class="sortable-th" data-sort-field="bankName"><span class="sort-label">银行 <span class="sort-arrow">' + getSortArrow('bankName') + '</span></span></th>' +
        '<th>卡片名称</th>' +
        '<th>尾号</th>' +
        '<th class="sortable-th" data-sort-field="billingDay"><span class="sort-label">账单日 <span class="sort-arrow">' + getSortArrow('billingDay') + '</span></span></th>' +
        '<th class="sortable-th" data-sort-field="daysToRepayment"><span class="sort-label">还款日 <span class="sort-arrow">' + getSortArrow('daysToRepayment') + '</span></span></th>' +
        '<th class="sortable-th" data-sort-field="gracePeriod"><span class="sort-label">免息期 <span class="sort-arrow">' + getSortArrow('gracePeriod') + '</span></span></th>' +
        '<th>状态</th>' +
        '<th>操作</th>' +
        '</tr></thead>',
        '<tbody>' + rows + '</tbody>',
        '</table>'
      ].join('');

      contentEl.querySelectorAll('.sortable-th').forEach((th) => {
        th.addEventListener('click', () => toggleSort(th.dataset.sortField));
      });

      contentEl.querySelectorAll('.js-bank-icon').forEach((img) => {
        img.addEventListener('error', () => {
          img.style.display = 'none';
          if (img.nextElementSibling) img.nextElementSibling.style.display = 'inline-flex';
        }, { once: true });
      });

      contentEl.querySelectorAll('.status-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          await toggleRepaid(Number(btn.dataset.cardId), btn.dataset.repaid === 'true' || btn.dataset.repaid === '1');
          btn.disabled = false;
        });
      });

      contentEl.querySelectorAll('.js-edit-card').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!banksCache.length) {
            try { await loadBanks() } catch (err) { showToast(err.message || '加载银行失败'); return }
          }
          const card = allItems.find(item => item.cardId === Number(btn.dataset.cardId));
          if (!card) return;
          openEditForm(card);
        });
      });

      contentEl.querySelectorAll('.js-delete-card').forEach((btn) => {
        btn.addEventListener('click', () => {
          removeCard(Number(btn.dataset.cardId), btn.dataset.cardName || '');
        });
      });
    }

    async function loadCards(showLoading = true) {
      if (showLoading) {
        loadingEl.style.display = 'block';
        contentEl.innerHTML = '';
      }
      refreshBtn.disabled = true;
      refreshBtn.textContent = '刷新中...';
      try {
        const res = await fetch('/api/cards', { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('加载卡片失败');
        const data = await res.json();
        allItems = Array.isArray(data.items) ? data.items : [];
        lastMeta = data.meta || null;
        fillBankFilter(allItems);
        updateSummary(allItems);
        lastUpdatedChip.textContent = '🕒 更新于 ' + formatLocalDate(lastMeta && lastMeta.generatedAt ? lastMeta.generatedAt : new Date().toISOString());
        applyFilters();
      } catch (err) {
        contentEl.innerHTML = '<div class="empty">' + escapeHtml(err.message || '加载失败') + '</div>';
        resultHint.textContent = '加载失败';
      } finally {
        loadingEl.style.display = 'none';
        refreshBtn.disabled = false;
        refreshBtn.textContent = '刷新数据';
      }
    }

    [searchInput, bankFilter].forEach((el) => {
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', () => {
        applyFilters();
      });
    });

    bindQuickFilters();
    syncQuickFilters();
    updateRuleInputs();

    [cardNumberInput, billingDayInput, repaymentDayInput, graceDaysInput].forEach((inputEl) => {
      inputEl.addEventListener('input', () => sanitizeDigitsInput(inputEl, inputEl === cardNumberInput ? 16 : 2));
    });

    [cardNameInput, bankSelect, billingDayInput, repaymentDayInput, graceDaysInput, bankNameInput, bankIconUrlInput].forEach((inputEl) => {
      inputEl.addEventListener('input', () => {
        const map = new Map([
          [cardNameInput, cardNameError],
          [bankSelect, bankSelectError],
          [billingDayInput, billingDayError],
          [repaymentDayInput, repaymentDayError],
          [graceDaysInput, graceDaysError],
          [bankNameInput, bankNameError],
          [bankIconUrlInput, bankIconUrlError]
        ]);
        clearError(inputEl, map.get(inputEl));
      });
    });

    ruleTypeSelect.addEventListener('change', updateRuleInputs);
    manageBanksBtn.addEventListener('click', async () => {
      try {
        await loadBanks();
      } catch (err) {
        showToast(err.message || '加载银行失败');
        return;
      }
      formPanel.classList.remove('show');
      resetCardForm();
      resetBankForm();
      openModal('银行管理', '新增、编辑或删除银行，卡片表单会自动同步。', bankPanel);
      bankNameInput.focus();
    });

    newCardBtn.addEventListener('click', async () => {
      if (!banksCache.length) {
        try {
          await loadBanks();
        } catch (err) {
          showToast(err.message || '加载银行失败');
          return;
        }
      }
      bankPanel.classList.remove('show');
      resetBankForm();
      resetCardForm();
      openCreateForm();
    });
    cancelBankBtn.addEventListener('click', () => {
      bankPanel.classList.remove('show');
      resetBankForm();
      closeModal();
    });
    saveBankBtn.addEventListener('click', saveBank);

    cancelCardBtn.addEventListener('click', () => {
      formPanel.classList.remove('show');
      resetCardForm();
      closeModal();
    });
    saveCardBtn.addEventListener('click', saveCard);

    closeModalBtn.addEventListener('click', () => {
      formPanel.classList.remove('show');
      bankPanel.classList.remove('show');
      resetCardForm();
      resetBankForm();
      closeModal();
    });

    modalShell.addEventListener('click', (event) => {
      if (event.target === modalShell) {
        closeModalBtn.click();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modalShell.classList.contains('show')) {
        closeModalBtn.click();
      }
    });

    refreshBtn.addEventListener('click', () => loadCards(false));

    loadBanks().catch(() => {});
    loadCards();
  </script>
</body>
</html>`
}
