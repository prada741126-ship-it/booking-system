/**
 * profit.js — Profit Settlement Page (Ctrl+2)
 * Booking System v2.2.0
 * Accountant fills chargeCompany -> auto-calc profit = chargeGuest - chargeCompany
 * Only shows paid bookings (free bookings shown grayed out without input)
 * Silent save: updates DOM in-place without full page re-render
 * Pagination: 10 per page, search, sort, expand all
 */
var ProfitPage = (function () {

  var _filterFee = '';  /* '', 'free', 'paid' */
  var _filterPending = false;  /* true: only show checked-out (pending settlement) */

  /* Pagination state */
  var _page = 1;
  var _search = '';
  var _sortField = 'agent';
  var _sortAsc = true;
  var _expandAll = false;

  /* Selected bookings for batch archive (Set of fbKey, persists across pages) */
  var _selectedSet = new Set();

  /* ===== Data helper: returns {filtered, sorted, pageData} ===== */
  function _getData() {
    var month = State.get('workingMonth') || Utils.currentMonth();
    var monthBookings = Filters.filterBookings(Bookings.getAll(), { month: month });
    var filtered = _filterFee ? monthBookings.filter(function (b) { return b.feeStatus === _filterFee; }) : monthBookings;
    /* Pending settlement filter: only checked-out */
    if (_filterPending) {
      filtered = filtered.filter(function (b) { return b.status === BOOKING_STATUS.CHECKED_OUT; });
    }
    var searched = Paginator.filterBySearch(filtered, _search);
    var sorted = Paginator.sortBy(searched, _sortField, _sortAsc);
    var pageData = Paginator.getPage(sorted, _page, _expandAll);
    return { filtered: filtered, sorted: sorted, pageData: pageData };
  }

  function render() {
    var container = document.getElementById('page-profit');
    if (!container) return;

    var month = State.get('workingMonth') || Utils.currentMonth();
    var monthBookings = Filters.filterBookings(Bookings.getAll(), { month: month });
    var feeCounts = Stats.countByFeeStatus(monthBookings);
    var feeStatsData = Stats.feeStats(monthBookings);

    var data = _getData();
    var pages = Paginator.totalPages(data.sorted, _expandAll);

    /* Count pending settlement (checked-out) bookings */
    var pendingCount = monthBookings.filter(function (b) { return b.status === BOOKING_STATUS.CHECKED_OUT; }).length;
    var selectedCount = _selectedSet.size;

    var html = '';

    /* Page header */
    html += '<div class="page-header">';
    html += '  <h3>利潤結算 — ' + month + '</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-secondary" onclick="window.print()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>';
    html += '      列印';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    /* KPI Cards */
    html += '<div class="kpi-grid" id="profit-kpi-grid">';
    html += _buildKPIs(monthBookings, feeCounts, feeStatsData);
    html += '</div>';

    /* Quick filter */
    html += '<div class="quick-filters" style="margin-bottom:var(--sp-4);">';
    html += '<button class="quick-filter-btn' + (_filterFee === '' ? ' active' : '') + '" onclick="ProfitPage.setFilter(\'\')">全部 (' + monthBookings.length + ')</button>';
    html += '<button class="quick-filter-btn' + (_filterFee === 'paid' ? ' active' : '') + '" onclick="ProfitPage.setFilter(\'paid\')">收費 (' + feeCounts.paid + ')</button>';
    html += '<button class="quick-filter-btn' + (_filterFee === 'free' ? ' active' : '') + '" onclick="ProfitPage.setFilter(\'free\')">免費 (' + feeCounts.free + ')</button>';
    html += '</div>';

    /* Profit table */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div>利潤明細';
    html += '    <span style="font-size:var(--fs-xs);color:var(--text-muted);font-weight:400;margin-left:var(--sp-2);">' + data.sorted.length + ' 筆</span>';
    html += '  </div>';

    /* Formula hint */
    html += '<div style="margin-bottom:var(--sp-2);color:var(--text-muted);font-size:var(--fs-xs);">';
    html += '利潤 = 向客人收 − 交公司。免費房以灰色顯示，不需填入交公司金額。';
    html += '</div>';

    /* Batch archive toolbar */
    html += '<div class="batch-archive-toolbar" style="display:flex;align-items:center;gap:var(--sp-2);margin-bottom:var(--sp-3);flex-wrap:wrap;">';
    html += '<button class="btn btn-sm ' + (_filterPending ? 'btn-primary' : 'btn-secondary') + '" onclick="ProfitPage.togglePendingFilter()">';
    html += _filterPending ? '✓ 只顯示待結算' : '只顯示待結算';
    html += '</button>';
    if (pendingCount > 0) {
      html += '<span class="pending-badge">' + pendingCount + ' 筆待結算</span>';
    }
    html += '<span style="flex:1;"></span>';
    if (selectedCount > 0) {
      html += '<button class="btn btn-sm btn-danger" onclick="ProfitPage.batchArchive()">';
      html += '📦 歸檔已選 (' + selectedCount + ')';
      html += '</button>';
      html += '<button class="btn btn-sm btn-ghost" onclick="ProfitPage.clearSelection()">清除勾選</button>';
    }
    html += '</div>';

    /* Toolbar: search + expand toggle */
    html += Paginator.renderToolbar(
      Paginator.renderSearch(_search, 'ProfitPage.onSearch', '搜索客人姓名、代理、酒店...'),
      Paginator.renderExpandToggle(_expandAll, 'ProfitPage.toggleExpand')
    );

    if (data.sorted.length === 0) {
      html += _emptyStateMini('暫無記錄');
    } else {
      html += '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
      html += '<table class="data-table"><thead><tr>';
      html += '<th style="width:36px;text-align:center;">勾選</th>';
      html += Paginator.renderTH('代理', 'agent', _sortField, _sortAsc, 'ProfitPage.sortByCol');
      html += Paginator.renderTH('客人', 'guestName', _sortField, _sortAsc, 'ProfitPage.sortByCol');
      html += '<th>酒店</th>';
      html += '<th style="text-align:right;width:90px;">向客人收</th>';
      html += '<th style="text-align:right;width:90px;">交公司</th>';
      html += '<th style="text-align:right;width:90px;">利潤</th>';
      html += '<th style="width:50px;">幣別</th>';
      html += '</tr></thead><tbody id="profit-table-body">';

      for (var i = 0; i < data.pageData.length; i++) {
        html += _profitRow(data.pageData[i]);
      }

      /* Summary row — calculated from full filtered data */
      html += _summaryRow(data.filtered);

      html += '</tbody></table></div></div>';

      /* Pagination nav */
      html += '<div id="profit-paginator-nav">';
      html += Paginator.renderNav(_page, pages, data.sorted.length, 'ProfitPage.goPage');
      html += '</div>';
    }
    html += '</div>';

    container.innerHTML = html;
  }

  /* ===== Re-render body only (for pagination controls) ===== */
  function _renderBody() {
    var tbody = document.getElementById('profit-table-body');
    if (!tbody) return;

    var data = _getData();
    var pages = Paginator.totalPages(data.sorted, _expandAll);

    var html = '';
    for (var i = 0; i < data.pageData.length; i++) {
      html += _profitRow(data.pageData[i]);
    }
    html += _summaryRow(data.filtered);
    tbody.innerHTML = html;

    /* Update pagination nav */
    var navContainer = document.getElementById('profit-paginator-nav');
    if (navContainer) {
      navContainer.innerHTML = Paginator.renderNav(_page, pages, data.sorted.length, 'ProfitPage.goPage');
    }
  }

  function goPage(n) {
    _page = n;
    _renderBody();
  }

  function onSearch(term) {
    _search = term;
    _page = 1;
    _selectedSet.clear();
    _renderBody();
  }

  function sortByCol(field) {
    if (_sortField === field) {
      _sortAsc = !_sortAsc;
    } else {
      _sortField = field;
      _sortAsc = (field === 'agent' || field === 'guestName' ? true : false);
    }
    _page = 1;
    _selectedSet.clear();
    _renderBody();
  }

  function toggleExpand(val) {
    _expandAll = val;
    _page = 1;
    _renderBody();
  }

  /* ===== Row builder ===== */
  function _profitRow(b) {
    var curr = b.currency || CURRENCY_DEFAULT;
    var isPaid = b.feeStatus === FEE_TYPES.PAID;
    var rules = STATUS_RULES[b.status] || { canEdit: true };
    var chargeGuest = Number(b.chargeGuest) || 0;
    var chargeCompany = Number(b.chargeCompany) || 0;
    var profit = chargeGuest - chargeCompany;
    var isCheckOut = b.status === BOOKING_STATUS.CHECKED_OUT;
    var isChecked = _selectedSet.has(b._fbKey);

    /* Overdue: checked-out more than CHECKOUT_OVERDUE_DAYS ago */
    var isOverdue = false;
    if (isCheckOut && b.checkOut) {
      var todayStr = Utils.today();
      var diffDays = Utils.daysBetween(b.checkOut, todayStr);
      if (diffDays > CONFIG.CHECKOUT_OVERDUE_DAYS) {
        isOverdue = true;
      }
    }

    var rowStyle = '';
    if (!isPaid) rowStyle = 'opacity:0.5;';
    if (isOverdue) rowStyle += 'background:rgba(239,68,68,0.08);';

    var html = '<tr data-fbkey="' + Utils.escapeHtml(b._fbKey || '') + '"'
      + (rowStyle ? ' style="' + rowStyle + '"' : '') + '>';

    /* Checkbox cell (only checked-out can be checked) */
    html += '<td style="text-align:center;">';
    if (isCheckOut) {
      html += '<input type="checkbox" class="archive-checkbox"' + (isChecked ? ' checked' : '') + ' ';
      html += 'onchange="ProfitPage.toggleSelect(\'' + Utils.escapeHtml(b._fbKey || '') + '\', this)"';
      if (isOverdue) html += ' title="此訂房已超期未結算"';
      html += '>';
    } else {
      html += '<span style="color:var(--text-muted);font-size:var(--fs-xs);">-</span>';
    }
    html += '</td>';

    html += '<td style="font-weight:600;">' + Utils.escapeHtml(b.agent || '-') + '</td>';
    html += '<td>' + Utils.escapeHtml(b.guestName || '-') + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.escapeHtml(b.hotel || '-') + '</td>';

    /* Charge guest (read-only) */
    html += '<td class="num-cell cell-cg">';
    if (isPaid) {
      html += Utils.formatCurrency(chargeGuest, curr);
    } else {
      html += '<span style="color:var(--text-muted);">-</span>';
    }
    html += '</td>';

    /* Charge company (editable for paid bookings) */
    html += '<td class="num-cell cell-cc">';
    if (isPaid) {
      if (rules.canEdit) {
        html += '<input type="number" min="0" class="fee-input" value="' + chargeCompany + '" ';
        html += 'onchange="ProfitPage.updateChargeCompany(this,\'' + Utils.escapeHtml(b._fbKey || '') + '\')" ';
        html += 'style="width:70px;text-align:right;padding:2px 4px;font-size:var(--fs-sm);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--bg-surface);color:var(--text-primary);">';
      } else {
        html += Utils.formatCurrency(chargeCompany, curr);
      }
    } else {
      html += '<span style="color:var(--text-muted);">-</span>';
    }
    html += '</td>';

    /* Profit (auto-calculated) */
    html += '<td class="num-cell cell-profit" style="font-weight:700;';
    if (isPaid) {
      html += profit > 0 ? 'color:var(--color-success);">' : profit < 0 ? 'color:var(--color-danger);">' : '">';
      html += Utils.formatCurrency(profit, curr);
    } else {
      html += 'color:var(--text-muted);">-</span>';
    }
    html += '</td>';

    /* Currency (editable dropdown) */
    html += '<td style="font-size:var(--fs-sm);">';
    html += '<select class="fee-input" onchange="ProfitPage.updateCurrency(this,\'' + Utils.escapeHtml(b._fbKey || '') + '\')" ';
    html += 'style="width:60px;padding:2px 4px;font-size:var(--fs-sm);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--bg-surface);color:var(--text-primary);">';
    for (var ci = 0; ci < CURRENCY_OPTIONS.length; ci++) {
      html += '<option value="' + CURRENCY_OPTIONS[ci].value + '"' + (CURRENCY_OPTIONS[ci].value === curr ? ' selected' : '') + '>' + Utils.escapeHtml(CURRENCY_OPTIONS[ci].value) + '</option>';
    }
    html += '</select>';
    html += '</td>';

    html += '</tr>';
    return html;
  }

  /* ===== Summary row ===== */
  function _summaryRow(bookings) {
    var totals = _calcTotals(bookings);

    var html = '<tr id="profit-summary-row" style="background:var(--bg-base);font-weight:700;border-top:2px solid var(--border-default);">';
    html += '<td colspan="4">合計</td>';
    html += '<td class="num-cell">' + Utils.formatCurrency(totals.chargeGuest, CURRENCY_DEFAULT) + '</td>';
    html += '<td class="num-cell">' + Utils.formatCurrency(totals.chargeCompany, CURRENCY_DEFAULT) + '</td>';
    html += '<td class="num-cell" style="color:' + (totals.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)') + ';">' + Utils.formatCurrency(totals.profit, CURRENCY_DEFAULT) + '</td>';
    html += '<td></td>';
    html += '</tr>';
    return html;
  }

  function _calcTotals(bookings) {
    var chargeGuest = 0, chargeCompany = 0, profit = 0;
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      if (b.feeStatus === 'paid') {
        chargeGuest += Number(b.chargeGuest) || 0;
        chargeCompany += Number(b.chargeCompany) || 0;
        profit += (Number(b.chargeGuest) || 0) - (Number(b.chargeCompany) || 0);
      }
    }
    return { chargeGuest: chargeGuest, chargeCompany: chargeCompany, profit: profit };
  }

  function _buildKPIs(monthBookings, feeCounts, feeStatsData) {
    var html = '';
    html += _kpiCard('kpi-amber', '收費房', feeCounts.paid, '間', '需填入交公司金額',
      '<svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>');
    if (feeStatsData.paid.count > 0) {
      html += _kpiCard('kpi-blue', '向客人收合計', Utils.formatCurrency(feeStatsData.paid.chargeGuest, CURRENCY_DEFAULT), '', '收費房',
        '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>');
      html += _kpiCard('kpi-gold', '交公司合計', Utils.formatCurrency(feeStatsData.paid.chargeCompany, CURRENCY_DEFAULT), '', '收費房',
        '<svg viewBox="0 0 24 24"><path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>');
      var totalProfit = feeStatsData.paid.chargeGuest - feeStatsData.paid.chargeCompany;
      html += _kpiCard(totalProfit >= 0 ? 'kpi-green' : 'kpi-amber', '利潤合計', Utils.formatCurrency(totalProfit, CURRENCY_DEFAULT), '', '客人收 - 公司',
        '<svg viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>');
    }
    return html;
  }

  /* ===== Silent update: chargeCompany ===== */
  function updateChargeCompany(inputEl, fbKey) {
    try {
      /* Seal check */
      var _sc = Bookings.getByKey(fbKey);
      if (_sc && _sc.checkOut && State.isMonthClosed(_sc.checkOut.slice(0, 7))) {
        Toast.warning('此月份已封存，不可修改');
        return;
      }
      var num = Number(inputEl.value) || 0;
      var updated = Bookings.update(fbKey, { chargeCompany: num });
      if (updated) {
        /* Update profit cell in-place */
        var tr = inputEl.closest('tr');
        if (tr) {
          var profitCell = tr.querySelector('.cell-profit');
          if (profitCell) {
            var curr = updated.currency || CURRENCY_DEFAULT;
            var chargeGuest = Number(updated.chargeGuest) || 0;
            var chargeCompany = Number(updated.chargeCompany) || 0;
            var profit = chargeGuest - chargeCompany;
            profitCell.style.fontWeight = '700';
            profitCell.style.color = profit > 0 ? 'var(--color-success)' : profit < 0 ? 'var(--color-danger)' : '';
            profitCell.textContent = Utils.formatCurrency(profit, curr);
          }
        }
        _updateSummary();
        _updateKPIs();
      }
    } catch (e) {
      console.error('[ProfitPage] updateChargeCompany error:', e);
      Toast.show('更新失敗', 'error');
    }
  }

  /* ===== Silent update: currency ===== */
  function updateCurrency(selectEl, fbKey) {
    try {
      /* Seal check */
      var _sc = Bookings.getByKey(fbKey);
      if (_sc && _sc.checkOut && State.isMonthClosed(_sc.checkOut.slice(0, 7))) {
        Toast.warning('此月份已封存，不可修改');
        return;
      }
      var newCurr = selectEl.value;
      var updated = Bookings.update(fbKey, { currency: newCurr });
      if (updated) {
        var tr = selectEl.closest('tr');
        if (tr) {
          var curr = updated.currency || CURRENCY_DEFAULT;
          var chargeGuest = Number(updated.chargeGuest) || 0;
          var chargeCompany = Number(updated.chargeCompany) || 0;
          var profit = chargeGuest - chargeCompany;
          var isPaid = updated.feeStatus === FEE_TYPES.PAID;

          /* Update charge guest cell */
          var cgCell = tr.querySelector('.cell-cg');
          if (cgCell && isPaid) {
            cgCell.textContent = Utils.formatCurrency(chargeGuest, curr);
          }

          /* Update profit cell */
          var profitCell = tr.querySelector('.cell-profit');
          if (profitCell && isPaid) {
            profitCell.style.fontWeight = '700';
            profitCell.style.color = profit > 0 ? 'var(--color-success)' : profit < 0 ? 'var(--color-danger)' : '';
            profitCell.textContent = Utils.formatCurrency(profit, curr);
          }
        }
        Toast.show('幣別已更新', 'success');
      }
    } catch (e) {
      console.error('[ProfitPage] updateCurrency error:', e);
      Toast.show('更新失敗', 'error');
    }
  }

  /* ===== Update summary row in-place — NOW CALCULATES FROM FULL DATA ===== */
  function _updateSummary() {
    var summaryRow = document.getElementById('profit-summary-row');
    if (!summaryRow) return;

    /* Calculate from full filtered data, NOT from DOM rows */
    var data = _getData();
    var totals = _calcTotals(data.filtered);

    summaryRow.innerHTML = '<td colspan="4">合計</td>';
    summaryRow.innerHTML += '<td class="num-cell">' + Utils.formatCurrency(totals.chargeGuest, CURRENCY_DEFAULT) + '</td>';
    summaryRow.innerHTML += '<td class="num-cell">' + Utils.formatCurrency(totals.chargeCompany, CURRENCY_DEFAULT) + '</td>';
    summaryRow.innerHTML += '<td class="num-cell" style="color:' + (totals.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)') + ';">' + Utils.formatCurrency(totals.profit, CURRENCY_DEFAULT) + '</td>';
    summaryRow.innerHTML += '<td></td>';
  }

  /* ===== Update KPI cards in-place ===== */
  function _updateKPIs() {
    var kpiGrid = document.getElementById('profit-kpi-grid');
    if (!kpiGrid) return;
    var month = State.get('workingMonth') || Utils.currentMonth();
    var monthBookings = Filters.filterBookings(Bookings.getAll(), { month: month });
    var feeCounts = Stats.countByFeeStatus(monthBookings);
    var feeStatsData = Stats.feeStats(monthBookings);
    kpiGrid.innerHTML = _buildKPIs(monthBookings, feeCounts, feeStatsData);

    /* Also update filter buttons */
    var filterButtons = document.querySelectorAll('.quick-filter-btn');
    if (filterButtons.length >= 3) {
      filterButtons[0].textContent = '全部 (' + monthBookings.length + ')';
      filterButtons[1].textContent = '收費 (' + feeCounts.paid + ')';
      filterButtons[2].textContent = '免費 (' + feeCounts.free + ')';
    }
  }

  function setFilter(fee) {
    _filterFee = fee;
    _page = 1;
    _search = '';
    _selectedSet.clear();
    render();
  }

  /* ===== Private helpers ===== */
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

  /* ===== Toggle checkbox selection (cross-page persistence) ===== */
  function toggleSelect(fbKey, checkboxEl) {
    if (checkboxEl.checked) {
      _selectedSet.add(fbKey);
    } else {
      _selectedSet.delete(fbKey);
    }
    /* Update batch archive toolbar count */
    _updateBatchToolbar();
  }

  /* ===== Toggle "only pending settlement" filter ===== */
  function togglePendingFilter() {
    _filterPending = !_filterPending;
    _page = 1;
    _selectedSet.clear();
    render();
  }

  /* ===== Clear all selections ===== */
  function clearSelection() {
    _selectedSet.clear();
    render();
  }

  /* ===== Batch archive selected bookings ===== */
  function batchArchive() {
    if (_selectedSet.size === 0) {
      Toast.warning('請先勾選要歸檔的訂房');
      return;
    }

    /* Build list of selected bookings for confirmation */
    var items = [];
    var invalid = [];
    _selectedSet.forEach(function (fbKey) {
      var b = Bookings.getByKey(fbKey);
      if (b && b.status === BOOKING_STATUS.CHECKED_OUT && !b.archived) {
        items.push(b);
      } else {
        invalid.push(fbKey);
      }
    });

    if (items.length === 0) {
      Toast.warning('沒有可歸檔的已退房訂房');
      _selectedSet.clear();
      render();
      return;
    }

    /* Remove invalid keys from selection */
    invalid.forEach(function (fbKey) { _selectedSet.delete(fbKey); });

    /* Call bridge function to show confirmation modal */
    if (typeof confirmBatchArchive === 'function') {
      confirmBatchArchive(items);
    }
  }

  /* ===== Update batch archive toolbar count in-place ===== */
  function _updateBatchToolbar() {
    var count = _selectedSet.size;
    var archiveBtn = document.querySelector('.batch-archive-toolbar .btn-danger');
    if (archiveBtn && count > 0) {
      /* Just update the count text */
      archiveBtn.textContent = '📦 歸檔已選 (' + count + ')';
    } else {
      /* Button doesn't exist yet (0→1) or count is 0 (1→0) — need full re-render */
      render();
    }
  }

  function _emptyStateMini(text) {
    return '<div style="padding:var(--sp-6);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">' + Utils.escapeHtml(text) + '</div>';
  }

  return {
    render: render,
    goPage: goPage,
    onSearch: onSearch,
    sortByCol: sortByCol,
    toggleExpand: toggleExpand,
    updateChargeCompany: updateChargeCompany,
    updateCurrency: updateCurrency,
    setFilter: setFilter,
    toggleSelect: toggleSelect,
    togglePendingFilter: togglePendingFilter,
    batchArchive: batchArchive,
    clearSelection: clearSelection
  };
})();

function renderProfit() { ProfitPage.render(); }
