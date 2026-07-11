/**
 * profit.js — Profit Settlement Page (Ctrl+2)
 * Booking System v2.0.9
 * Accountant fills chargeCompany -> auto-calc profit = chargeGuest - chargeCompany
 * Only shows paid bookings (free bookings shown grayed out without input)
 * Silent save: updates DOM in-place without full page re-render
 */
var ProfitPage = (function () {

  var _filterFee = '';  /* '', 'free', 'paid' */

  function render() {
    var container = document.getElementById('page-profit');
    if (!container) return;

    var month = State.get('workingMonth') || Utils.currentMonth();
    var monthBookings = Filters.filterBookings(Bookings.getAll(), { month: month });
    var feeCounts = Stats.countByFeeStatus(monthBookings);
    var feeStatsData = Stats.feeStats(monthBookings);

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
    var filtered = _filterFee ? monthBookings.filter(function (b) { return b.feeStatus === _filterFee; }) : monthBookings;
    var sorted = _sortBookings(filtered);

    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div>利潤明細</div>';

    /* Formula hint */
    html += '<div style="margin-bottom:var(--sp-2);color:var(--text-muted);font-size:var(--fs-xs);">';
    html += '利潤 = 向客人收 − 交公司。免費房以灰色顯示，不需填入交公司金額。';
    html += '</div>';

    if (sorted.length === 0) {
      html += _emptyStateMini('暫無記錄');
    } else {
      html += '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
      html += '<table class="data-table"><thead><tr>';
      html += '<th>代理</th><th>客人</th><th>酒店</th>';
      html += '<th style="text-align:right;width:90px;">向客人收</th>';
      html += '<th style="text-align:right;width:90px;">交公司</th>';
      html += '<th style="text-align:right;width:90px;">利潤</th>';
      html += '<th style="width:50px;">幣別</th>';
      html += '</tr></thead><tbody id="profit-table-body">';

      for (var i = 0; i < sorted.length; i++) {
        html += _profitRow(sorted[i]);
      }

      /* Summary row */
      html += _summaryRow(sorted);

      html += '</tbody></table></div></div>';
    }
    html += '</div>';

    container.innerHTML = html;
  }

  /* ===== Sort by agent first, then checkIn ===== */
  function _sortBookings(bookings) {
    return bookings.slice().sort(function (a, b) {
      var agentA = (a.agent || '').toLowerCase();
      var agentB = (b.agent || '').toLowerCase();
      if (agentA !== agentB) return agentA < agentB ? -1 : 1;
      return (a.checkIn || '') < (b.checkIn || '') ? -1 : 1;
    });
  }

  /* ===== Row builder ===== */
  function _profitRow(b) {
    var curr = b.currency || CURRENCY_DEFAULT;
    var isPaid = b.feeStatus === FEE_TYPES.PAID;
    var rules = STATUS_RULES[b.status] || { canEdit: true };
    var chargeGuest = Number(b.chargeGuest) || 0;
    var chargeCompany = Number(b.chargeCompany) || 0;
    var profit = chargeGuest - chargeCompany;

    var html = '<tr data-fbkey="' + Utils.escapeHtml(b._fbKey || '') + '"'
      + (isPaid ? '' : ' style="opacity:0.5;')
      + '">';

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
    html += '<td colspan="3">合計</td>';
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

  /* ===== Update summary row in-place ===== */
  function _updateSummary() {
    var tbody = document.getElementById('profit-table-body');
    if (!tbody) return;
    var summaryRow = document.getElementById('profit-summary-row');
    if (!summaryRow) return;

    /* Recalculate from all visible booking rows */
    var dataRows = tbody.querySelectorAll('tr[data-fbkey]');
    var totals = { chargeGuest: 0, chargeCompany: 0, profit: 0 };

    for (var i = 0; i < dataRows.length; i++) {
      var fbKey = dataRows[i].getAttribute('data-fbkey');
      var b = Bookings.getByKey(fbKey);
      if (!b) continue;
      if (b.feeStatus === 'paid') {
        totals.chargeGuest += Number(b.chargeGuest) || 0;
        totals.chargeCompany += Number(b.chargeCompany) || 0;
        totals.profit += (Number(b.chargeGuest) || 0) - (Number(b.chargeCompany) || 0);
      }
    }

    summaryRow.innerHTML = '<td colspan="3">合計</td>';
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

  function _emptyStateMini(text) {
    return '<div style="padding:var(--sp-6);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">' + Utils.escapeHtml(text) + '</div>';
  }

  return {
    render: render,
    updateChargeCompany: updateChargeCompany,
    updateCurrency: updateCurrency,
    setFilter: setFilter
  };
})();

function renderProfit() { ProfitPage.render(); }
