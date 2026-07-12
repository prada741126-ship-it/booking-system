/**
 * agent-performance.js — Agent Performance Page (Ctrl+4)
 * Booking System v2.2.0
 * Renders: KPI + agent × casino matrix + agent ranking + paginated per-agent breakdown
 * Note: Agents != Employees (agents represent customers, employees operate the Bot)
 */
var AgentPerfPage = (function () {

  /* Pagination state for detail table */
  var _page = 1;
  var _search = '';
  var _sortField = 'agent';
  var _sortAsc = true;
  var _expandAll = false;

  function render() {
    var container = document.getElementById('page-agent-performance');
    if (!container) return;

    var month = State.get('workingMonth') || Utils.currentMonth();
    var monthBookings = Filters.filterBookings(Bookings.getAll(), { month: month });
    var activeAgents = Agents.getAllNames();

    var html = '';

    /* Page header */
    html += '<div class="page-header">';
    html += '  <h3>代理業績 — ' + month + '</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-secondary" onclick="window.print()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>';
    html += '      列印';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    /* KPI Cards */
    var totalProfit = Stats.totalProfit(monthBookings.filter(function (b) { return b.feeStatus === 'paid'; }));
    html += '<div class="kpi-grid">';
    html += _kpiCard('kpi-blue', '活躍代理', activeAgents.length, '位', '本月有訂房代理',
      '<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>');
    html += _kpiCard('kpi-green', '總訂房數', monthBookings.length, '間', '本月所有訂房',
      '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>');
    html += _kpiCard('kpi-amber', '收費房利潤', Utils.formatCurrency(totalProfit, CURRENCY_DEFAULT), '', '收費房合計',
      '<svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>');
    html += _kpiCard('kpi-gold', '總房晚', Stats.calcMonthlyNights(monthBookings, month).nights, '晚', '一訂房 = 一房',
      '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>');
    html += '</div>';

    /* Agent × Casino matrix */
    html += '<div class="card" style="margin-bottom:var(--sp-4);">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg></div>代理 × 體系 矩陣</div>';
    html += _agentMatrixTable(monthBookings);
    html += '</div>';

    /* Two columns: ranking + profit breakdown */
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4);">';

    /* Agent ranking by count */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg></div>訂房排行</div>';
    html += _rankingTable(Stats.topAgents(monthBookings, 10), 'agent', '訂房數', 'requiredVolume', '所需轉碼');
    html += '</div>';

    /* Agent profit ranking */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div>利潤排行</div>';
    html += _profitRankingTable(monthBookings);
    html += '</div>';

    html += '</div>';

    /* ===== Paginated Booking Detail Table ===== */
    html += '<div class="card" style="margin-top:var(--sp-4);">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-8v2h14V9H7z"/></svg></div>逐筆訂房明細（含洗碼門檻）';
    html += '    <span style="font-size:var(--fs-xs);color:var(--text-muted);font-weight:400;margin-left:var(--sp-2);">' + monthBookings.length + ' 筆</span>';
    html += '  </div>';

    /* Formula hint */
    html += '<div style="margin-bottom:var(--sp-2);color:var(--text-muted);font-size:var(--fs-xs);">';
    html += '折抵天數 = 客戶轉碼 ÷ 每晚門檻（無條件退位）。轉碼金額請至「費用收取」頁面填寫。';
    html += '</div>';

    /* Toolbar */
    html += Paginator.renderToolbar(
      Paginator.renderSearch(_search, 'AgentPerfPage.onSearch', '搜索客人姓名、代理、酒店...'),
      Paginator.renderExpandToggle(_expandAll, 'AgentPerfPage.toggleExpand')
    );

    html += _detailTable(monthBookings);
    html += '</div>';

    container.innerHTML = html;
  }

  /* ===== Re-render helpers ===== */
  function _rerender() {
    render();
  }

  function goPage(n) {
    _page = n;
    _rerender();
  }

  function onSearch(term) {
    _search = term;
    _page = 1;
    _rerender();
  }

  function sortByCol(field) {
    if (_sortField === field) {
      _sortAsc = !_sortAsc;
    } else {
      _sortField = field;
      _sortAsc = (field === 'agent' || field === 'guestName' ? true : false);
    }
    _page = 1;
    _rerender();
  }

  function toggleExpand(val) {
    _expandAll = val;
    _page = 1;
    _rerender();
  }

  function _agentMatrixTable(bookings) {
    var matrix = Stats.agentMatrix(bookings);
    var agents = [];
    for (var a in matrix) {
      agents.push({ name: a, total: matrix[a]._total || 0 });
    }
    agents.sort(function (x, y) { return y.total - x.total; });

    var casinos = CASINO_ORDER.slice();
    for (var ag in matrix) {
      for (var ck in matrix[ag]) {
        if (ck !== '_total' && casinos.indexOf(ck) === -1) casinos.push(ck);
      }
    }

    if (agents.length === 0) return _emptyStateMini('暫無數據');

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="matrix-table"><thead><tr><th>代理</th>';
    for (var i = 0; i < casinos.length; i++) {
      html += '<th class="num-cell">' + Utils.escapeHtml(casinos[i]) + '</th>';
    }
    html += '<th class="num-cell">合計</th></tr></thead><tbody>';

    var grandTotal = 0;
    for (var j = 0; j < agents.length; j++) {
      var row = matrix[agents[j].name];
      html += '<tr><td style="font-weight:600;">' + Utils.escapeHtml(agents[j].name) + '</td>';
      for (var ci = 0; ci < casinos.length; ci++) {
        var count = row[casinos[ci]] || 0;
        html += '<td class="num-cell">' + (count || '-') + '</td>';
      }
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-primary);">' + (row._total || 0) + '</td></tr>';
      grandTotal += (row._total || 0);
    }

    html += '<tr style="background:var(--bg-base);font-weight:700;"><td>合計</td>';
    for (var ck2 = 0; ck2 < casinos.length; ck2++) {
      var colTotal = 0;
      for (var ai = 0; ai < agents.length; ai++) {
        colTotal += (matrix[agents[ai].name][casinos[ck2]] || 0);
      }
      html += '<td class="num-cell">' + (colTotal || '-') + '</td>';
    }
    html += '<td class="num-cell" style="color:var(--color-primary);">' + grandTotal + '</td></tr>';

    html += '</tbody></table></div></div>';
    return html;
  }

  function _rankingTable(items, field, label, extraField, extraLabel) {
    if (!items || items.length === 0) return _emptyStateMini('暫無數據');

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="data-table"><thead><tr><th>#</th><th>代理</th>';
    html += '<th class="num-cell">' + label + '</th>';
    if (extraField) {
      html += '<th class="num-cell">' + extraLabel + '</th>';
    }
    html += '</tr></thead><tbody>';

    for (var i = 0; i < items.length; i++) {
      var rank = i + 1;
      var rankIcon = rank === 1 ? '\uD83E\uDD47' : rank === 2 ? '\uD83E\uDD48' : rank === 3 ? '\uD83E\uDD49' : rank;
      html += '<tr><td style="text-align:center;">' + rankIcon + '</td>';
      html += '<td style="font-weight:600;">' + Utils.escapeHtml(items[i][field]) + '</td>';
      html += '<td class="num-cell">' + items[i].count + '</td>';
      if (extraField) {
        var ev = items[i][extraField];
        if (extraField === 'requiredVolume') {
          html += '<td class="num-cell">' + (ev ? Math.round(ev / 10000) + ' 萬' : '-') + '</td>';
        } else {
          html += '<td class="num-cell">' + (ev ? Utils.formatCurrency(ev, 'HKD') : '-') + '</td>';
        }
      }
      html += '</tr>';
    }

    html += '</tbody></table></div></div>';
    return html;
  }

  function _profitRankingTable(bookings) {
    var map = Stats.profitByAgent(bookings);
    var arr = [];
    for (var name in map) {
      if (map[name].profit > 0) {
        arr.push({ agent: name, profit: map[name].profit, count: map[name].count });
      }
    }
    arr.sort(function (a, b) { return b.profit - a.profit; });

    if (arr.length === 0) return _emptyStateMini('暫無利潤數據');

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="data-table"><thead><tr><th>#</th><th>代理</th><th class="num-cell">利潤</th></tr></thead><tbody>';

    for (var i = 0; i < arr.length; i++) {
      var rank = i + 1;
      var rankIcon = rank === 1 ? '\uD83E\uDD47' : rank === 2 ? '\uD83E\uDD48' : rank === 3 ? '\uD83E\uDD49' : rank;
      html += '<tr><td style="text-align:center;">' + rankIcon + '</td>';
      html += '<td style="font-weight:600;">' + Utils.escapeHtml(arr[i].agent) + '</td>';
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-warning);">' + Utils.formatCurrency(arr[i].profit, CURRENCY_DEFAULT) + '</td></tr>';
    }

    html += '</tbody></table></div></div>';
    return html;
  }

  function _detailTable(bookings) {
    if (!bookings || bookings.length === 0) return _emptyStateMini('暫無數據');

    /* Search → Sort → Page */
    var searched = Paginator.filterBySearch(bookings, _search);
    var sorted = Paginator.sortBy(searched, _sortField, _sortAsc);
    var pageData = Paginator.getPage(sorted, _page, _expandAll);
    var pages = Paginator.totalPages(sorted, _expandAll);

    if (sorted.length === 0) {
      return '<div style="padding:var(--sp-4);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">無匹配結果</div>';
    }

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="data-table"><thead><tr>';
    html += Paginator.renderTH('代理', 'agent', _sortField, _sortAsc, 'AgentPerfPage.sortByCol');
    html += Paginator.renderTH('客人', 'guestName', _sortField, _sortAsc, 'AgentPerfPage.sortByCol');
    html += '<th>酒店</th>';
    html += Paginator.renderTH('入住', 'checkIn', _sortField, _sortAsc, 'AgentPerfPage.sortByCol');
    html += '<th style="text-align:center;width:60px;">入住天數</th>';
    html += '<th style="text-align:right;width:60px;">每晚(萬)</th>';
    html += '<th style="text-align:right;width:70px;">總門檻(萬)</th>';
    html += '<th style="text-align:right;width:100px;">客戶轉碼(萬)</th>';
    html += '<th style="text-align:center;width:60px;">折抵(天)</th>';
    html += '<th style="text-align:center;width:60px;">剩餘(天)</th>';
    html += '<th>狀態</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < pageData.length; i++) {
      var b = pageData[i];
      var th = Number(b.threshold) || 0;
      var n = Number(b.nights) || 0;
      var totalTh = th * n;
      var thWan = Math.round(th / 10000);
      var totalThWan = Math.round(totalTh / 10000);

      var vol = Number(b.volume) || 0;
      var volWan = vol > 0 ? Math.round(vol / 10000) : 0;

      var discountDays = 0;
      if (vol > 0 && th > 0) {
        discountDays = Math.floor(vol / th);
      }
      var discountLabel = (vol > 0 && discountDays === 0) ? '0' : (vol > 0 ? discountDays : '-');

      var remaining = n - discountDays;
      var remainingLabel, remainingStyle;
      if (vol === 0) {
        remainingLabel = '-';
        remainingStyle = 'color:var(--text-muted);';
      } else if (remaining <= 0) {
        remainingLabel = '達標';
        remainingStyle = 'color:var(--color-success);font-weight:700;';
      } else {
        remainingLabel = remaining;
        remainingStyle = 'color:var(--color-danger);font-weight:700;';
      }

      var statusLabel = _statusLabel(b.status);
      html += '<tr>';
      html += '<td style="font-weight:600;">' + Utils.escapeHtml(b.agent || '-') + '</td>';
      html += '<td>' + Utils.escapeHtml(b.guestName || '-') + '</td>';
      html += '<td>' + Utils.escapeHtml(b.hotel || '-') + '</td>';
      html += '<td>' + Utils.escapeHtml((b.checkIn || '').slice(0, 10)) + '</td>';
      html += '<td style="text-align:center;">' + n + '</td>';
      html += '<td style="text-align:right;">' + thWan + '</td>';
      html += '<td style="text-align:right;">' + totalThWan + '</td>';
      html += '<td style="text-align:right;' + (vol === 0 ? 'color:var(--text-muted);' : '') + '">' + (vol > 0 ? volWan : '-') + '</td>';
      html += '<td style="text-align:center;">' + discountLabel + '</td>';
      html += '<td style="text-align:center;' + remainingStyle + '">' + remainingLabel + '</td>';
      html += '<td>' + statusLabel + '</td>';
      html += '</tr>';
    }

    html += '</tbody></table></div></div>';

    /* Pagination nav */
    html += Paginator.renderNav(_page, pages, sorted.length, 'AgentPerfPage.goPage');

    return html;
  }

  function _statusLabel(status) {
    var map = {
      'pending': '<span style="color:var(--color-info);">待確認</span>',
      'confirmed': '<span style="color:var(--color-warning);">已確認</span>',
      'checked-in': '<span style="color:var(--color-success);">已入住</span>',
      'checked-out': '<span style="color:var(--text-muted);">已退房</span>',
      'cancelled': '<span style="color:var(--color-danger);">已取消</span>'
    };
    return map[status] || Utils.escapeHtml(status || '-');
  }

  function _kpiCard(colorClass, label, value, unit, sub, iconSvg) {
    var html = '<div class="kpi-card ' + colorClass + '">';
    html += '  <div class="kpi-header"><span class="kpi-label">' + Utils.escapeHtml(label) + '</span><div class="kpi-icon">' + iconSvg + '</div></div>';
    html += '  <div class="kpi-value tabular-nums">' + value + '</div>';
    if (unit || sub) {
      html += '  <span class="kpi-sub">';
      if (unit) html += Utils.escapeHtml(unit);
      if (unit && sub) html += ' — ';
      if (sub) html += Utils.escapeHtml(sub);
      html += '</span>';
    }
    html += '</div>';
    return html;
  }

  function _emptyStateMini(text) {
    return '<div style="padding:var(--sp-6);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">' + Utils.escapeHtml(text) + '</div>';
  }

  return {
    render: render,
    goPage: goPage,
    onSearch: onSearch,
    sortByCol: sortByCol,
    toggleExpand: toggleExpand
  };
})();

function renderAgentPerformance() { AgentPerfPage.render(); }
