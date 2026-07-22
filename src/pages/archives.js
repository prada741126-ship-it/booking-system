/**
 * archives.js — History & Audit Page (Ctrl+5)
 * Booking System v2.2.1
 * Cancelled bookings are deleted directly (not archived). Only checked-out (settled) bookings are archived.
 * Renders: KPI + filters + archive records table + summary
 */
var ArchivesPage = (function () {

  var _filters = {};
  var _sortField = 'archivedAt';
  var _sortAsc = false;
  var _currentPage = 1;
  var _perPage = 20;

  function render() {
    var container = document.getElementById('page-archives');
    if (!container) return;

    var allArchives = Archives.getAll().filter(function (a) {
      return a.finalStatus !== BOOKING_STATUS.CANCELLED;
    });
    var stats = Archives.getStats(allArchives);

    var html = '';

    /* Page header */
    html += '<div class="page-header">';
    html += '  <h3>歷史核帳</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-secondary" onclick="window.print()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>';
    html += '      列印';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    /* KPI Cards */
    html += '<div class="kpi-grid">';
    html += _kpiCard('kpi-blue', '歸檔總數', stats.total, '筆', '永久保留',
      '<svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>');
    html += _kpiCard('kpi-green', '已退房', stats.checkedOut, '筆', '正常退房歸檔',
      '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>');
    html += _kpiCard('kpi-amber', '總利潤', Utils.formatCurrency(stats.totalProfit, CURRENCY_DEFAULT), '', '所有歸檔利潤',
      '<svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>');
    html += '</div>';

    /* Filter bar */
    html += '<div class="filter-bar">';
    html += '  <div class="filter-item"><label>月份</label><input type="month" id="ar-filter-month" value="' + (_filters.month || '') + '" onchange="ArchivesPage.onFilterChange()"></div>';

    html += '  <div class="filter-item"><label>體系</label><select id="ar-filter-casino" onchange="ArchivesPage.onFilterChange()"><option value="">全部</option>';
    var casinos = Hotels.getCasinos();
    for (var i = 0; i < casinos.length; i++) {
      html += '<option value="' + Utils.escapeHtml(casinos[i]) + '"' + (_filters.casino === casinos[i] ? ' selected' : '') + '>' + Utils.escapeHtml(casinos[i]) + '</option>';
    }
    html += '  </select></div>';

    html += '  <div class="filter-item"><label>代理</label><select id="ar-filter-agent" onchange="ArchivesPage.onFilterChange()"><option value="">全部</option>';
    var agentNames = Agents.getAllNames();
    for (var a = 0; a < agentNames.length; a++) {
      html += '<option value="' + Utils.escapeHtml(agentNames[a]) + '"' + (_filters.agent === agentNames[a] ? ' selected' : '') + '>' + Utils.escapeHtml(agentNames[a]) + '</option>';
    }
    html += '  </select></div>';

    html += '  <div class="filter-item"><label>狀態</label><select id="ar-filter-status" onchange="ArchivesPage.onFilterChange()"><option value="">全部</option>';
    html += '<option value="checked-out"' + (_filters.status === 'checked-out' ? ' selected' : '') + '>已退房</option>';
    html += '  </select></div>';

    html += '  <div class="filter-spacer"></div>';

    html += '  <div class="search-box" style="width:200px;">';
    html += '    <svg class="search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>';
    html += '    <input type="text" id="ar-search" placeholder="搜索..." value="' + Utils.escapeHtml(_filters.keyword || '') + '" oninput="ArchivesPage.onSearchChange(this.value)">';
    html += '  </div>';

    html += '  <button class="btn btn-ghost btn-sm" onclick="ArchivesPage.clearFilters()">清除</button>';
    html += '</div>';

    /* Apply filters and render table */
    var filtered = Archives.search(_filters).filter(function (a) {
      return a.finalStatus !== BOOKING_STATUS.CANCELLED;
    });
    var sorted = Filters.sortBookings(filtered, _sortField, _sortAsc);
    var total = sorted.length;
    var totalPages = Math.max(1, Math.ceil(total / _perPage));
    if (_currentPage > totalPages) _currentPage = totalPages;
    var pageData = Filters.paginate(sorted, _currentPage, _perPage);

    /* Summary for filtered results */
    if (total > 0) {
      var filteredStats = Archives.getStats(sorted);
      html += '<div class="card" style="margin-bottom:var(--sp-4);">';
      html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg></div>篩選結果匯總</div>';
      html += '  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sp-3);">';
      html += '    <div class="stat-row"><span class="stat-label">筆數</span><span class="stat-value">' + filteredStats.total + '</span></div>';
      html += '    <div class="stat-row"><span class="stat-label">退房</span><span class="stat-value">' + filteredStats.checkedOut + '</span></div>';
      html += '    <div class="stat-row"><span class="stat-label">利潤</span><span class="stat-value" style="color:var(--color-warning);font-weight:700;">' + Utils.formatCurrency(filteredStats.totalProfit, CURRENCY_DEFAULT) + '</span></div>';
      html += '  </div>';
      html += '</div>';
    }

    /* Archive table */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg></div>歸檔記錄 (' + total + ' 筆)</div>';

    if (pageData.length === 0) {
      html += _emptyState();
    } else {
      html += '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
      html += '<table class="data-table"><thead><tr>';
      html += _th('客人', 'guestName');
      html += _th('代理', 'agent');
      html += _th('體系', 'casino');
      html += _th('入住', 'checkIn');
      html += _th('退房', 'checkOut');
      html += _th('晚', 'nights', 'num-cell');
      html += _th('最終狀態', 'finalStatus');
      html += _th('幣別', 'currency');
      html += _th('費用', 'feeStatus');
      html += _th('利潤', 'profit', 'num-cell');
      html += _th('歸檔時間', 'archivedAt');
      html += '</tr></thead><tbody>';

      for (var i = 0; i < pageData.length; i++) {
        html += _archiveRow(pageData[i]);
      }

      html += '</tbody></table></div></div>';

      /* Pagination */
      if (total > _perPage) {
        html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--sp-3);">';
        html += '<span style="font-size:var(--fs-sm);color:var(--text-muted);">共 ' + total + ' 筆，第 ' + _currentPage + '/' + totalPages + ' 頁</span>';
        html += '<div style="display:flex;gap:var(--sp-2);">';
        html += '<button class="btn btn-secondary btn-sm" ' + (_currentPage <= 1 ? 'disabled' : '') + ' onclick="ArchivesPage.goPage(' + (_currentPage - 1) + ')">上一頁</button>';
        html += '<button class="btn btn-secondary btn-sm" ' + (_currentPage >= totalPages ? 'disabled' : '') + ' onclick="ArchivesPage.goPage(' + (_currentPage + 1) + ')">下一頁</button>';
        html += '</div></div>';
      }
    }

    html += '</div>';

    container.innerHTML = html;
  }

  function _archiveRow(a) {
    var curr = a.currency || CURRENCY_DEFAULT;
    var html = '<tr>';
    html += '<td style="font-weight:600;">' + Utils.escapeHtml(Utils.fixGuestName(a)) + '</td>';
    html += '<td>' + Utils.escapeHtml(a.agent || '-') + '</td>';
    html += '<td>' + Utils.escapeHtml(a.casino || '-') + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(a.checkIn) + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(a.checkOut) + '</td>';
    html += '<td class="num-cell">' + (a.nights || 0) + '</td>';
    /* Use finalStatus for archive badge */
    var fsLabel = BOOKING_STATUS_LABELS[a.finalStatus] || a.finalStatus || '-';
    html += '<td><span class="status-badge status-' + a.finalStatus + '">' + Utils.escapeHtml(fsLabel) + '</span></td>';
    html += '<td><span class="currency-badge">' + Utils.escapeHtml(curr) + '</span></td>';
    html += '<td><span class="fee-badge ' + (a.feeStatus || 'free') + '">' + (FEE_TYPE_LABELS[a.feeStatus] || '免費') + '</span></td>';
    html += '<td class="num-cell" style="' + (a.profit > 0 ? 'font-weight:700;color:var(--color-warning);' : '') + '">' + Utils.formatCurrency(a.profit, curr) + '</td>';
    /* Archived time */
    var archTime = a.archivedAt ? new Date(a.archivedAt).toLocaleDateString('zh-TW') : '--';
    html += '<td style="font-size:var(--fs-xs);color:var(--text-muted);">' + archTime + '</td>';
    html += '</tr>';
    return html;
  }

  function _th(label, field, extraClass) {
    var cls = extraClass || '';
    var sortIcon = '';
    if (field === _sortField) {
      sortIcon = _sortAsc ? ' \u25B2' : ' \u25BC';
    }
    return '<th class="' + cls + '" style="cursor:pointer;" onclick="ArchivesPage.sortBy(\'' + field + '\')">' + label + sortIcon + '</th>';
  }

  function onFilterChange() {
    _currentPage = 1;
    _filters = {};
    var monthEl = document.getElementById('ar-filter-month');
    var casinoEl = document.getElementById('ar-filter-casino');
    var agentEl = document.getElementById('ar-filter-agent');
    var statusEl = document.getElementById('ar-filter-status');
    if (monthEl && monthEl.value) _filters.month = monthEl.value;
    if (casinoEl && casinoEl.value) _filters.casino = casinoEl.value;
    if (agentEl && agentEl.value) _filters.agent = agentEl.value;
    if (statusEl && statusEl.value) _filters.status = statusEl.value;
    render();
  }

  function onSearchChange(val) {
    _filters.keyword = val || '';
    _currentPage = 1;
    render();
    var search = document.getElementById('ar-search');
    if (search) {
      search.focus();
      search.setSelectionRange(search.value.length, search.value.length);
    }
  }

  function clearFilters() {
    _filters = {};
    _currentPage = 1;
    render();
  }

  function sortBy(field) {
    if (field === _sortField) {
      _sortAsc = !_sortAsc;
    } else {
      _sortField = field;
      _sortAsc = true;
    }
    render();
  }

  function goPage(page) {
    _currentPage = page;
    render();
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

  function _emptyState() {
    return '<div class="empty-state">' +
      '<div class="empty-icon"><svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg></div>' +
      '<div class="empty-title">暫無歸檔記錄</div>' +
      '<div class="empty-desc">退房後確認歸檔的訂房將顯示於此</div>' +
      '</div>';
  }

  return {
    render: render,
    onFilterChange: onFilterChange,
    onSearchChange: onSearchChange,
    clearFilters: clearFilters,
    sortBy: sortBy,
    goPage: goPage
  };
})();

function renderArchives() { ArchivesPage.render(); }
