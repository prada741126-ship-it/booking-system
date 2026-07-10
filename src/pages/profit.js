/**
 * profit.js — Profit Settlement Page (Ctrl+2)
 * Booking System v2.0.0 (v8 spec)
 * Renders: KPI (profit/chargeGuest/chargeCompany) + profit by agent + profit by casino + by currency + detail table
 */
var ProfitPage = (function () {

  var _sortField = 'profit';
  var _sortAsc = false;

  function render() {
    var container = document.getElementById('page-profit');
    if (!container) return;

    var month = State.get('workingMonth') || Utils.currentMonth();
    var monthBookings = Filters.filterBookings(Bookings.getAll(), { month: month });
    var paidBookings = monthBookings.filter(function (b) {
      return b.feeStatus === FEE_TYPES.PAID;
    });

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
    var totalProfit = Stats.totalProfit(paidBookings);
    var totalGuest = Stats.totalChargeGuest(paidBookings);
    var totalCompany = Stats.totalChargeCompany(paidBookings);

    html += '<div class="kpi-grid">';
    html += _kpiCard('kpi-amber', '總利潤', Utils.formatCurrency(totalProfit, CURRENCY_DEFAULT), '', '向客人收 - 交公司',
      '<svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>');
    html += _kpiCard('kpi-blue', '向客人收', Utils.formatCurrency(totalGuest, CURRENCY_DEFAULT), '', '收費房合計',
      '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>');
    html += _kpiCard('kpi-green', '交公司', Utils.formatCurrency(totalCompany, CURRENCY_DEFAULT), '', '交賭場合計',
      '<svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>');
    html += _kpiCard('kpi-gold', '收費房數', paidBookings.length, '間', '本月收費訂房',
      '<svg viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>');
    html += '</div>';

    /* Profit by currency (important: don't mix currencies) */
    var byCurrency = Stats.chargeByCurrency(paidBookings);
    var currencyKeys = Object.keys(byCurrency);
    if (currencyKeys.length > 0) {
      html += '<div class="card" style="margin-bottom:var(--sp-4);">';
      html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M7 15h2v2H7zm0 4h2v-2H7zm4-4h2v2h-2zm0 4h2v-2h-2zm4-4h2v2h-2zm0 4h2v-2h-2z"/><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/></svg></div>分幣別結算</div>';
      html += '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
      html += '<table class="data-table"><thead><tr>';
      html += '<th>幣別</th><th class="num-cell">筆數</th><th class="num-cell">向客人收</th><th class="num-cell">交公司</th><th class="num-cell">利潤</th>';
      html += '</tr></thead><tbody>';
      for (var i = 0; i < currencyKeys.length; i++) {
        var curr = currencyKeys[i];
        var c = byCurrency[curr];
        html += '<tr>';
        html += '<td><span class="currency-badge">' + Utils.escapeHtml(curr) + '</span></td>';
        html += '<td class="num-cell">' + c.count + '</td>';
        html += '<td class="num-cell">' + Utils.formatCurrency(c.chargeGuest, curr) + '</td>';
        html += '<td class="num-cell">' + Utils.formatCurrency(c.chargeCompany, curr) + '</td>';
        html += '<td class="num-cell" style="font-weight:700;color:var(--color-warning);">' + Utils.formatCurrency(c.profit, curr) + '</td>';
        html += '</tr>';
      }
      html += '</tbody></table></div></div>';
      html += '</div>';
    }

    /* Two columns: by agent + by casino */
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4);margin-bottom:var(--sp-4);">';

    /* Profit by agent */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>代理利潤</div>';
    html += _profitByAgentTable(paidBookings);
    html += '</div>';

    /* Profit by casino */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div>體系利潤</div>';
    html += _profitByCasinoTable(paidBookings);
    html += '</div>';

    html += '</div>';

    /* Detail table */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg></div>收費明細</div>';
    html += _detailTable(paidBookings);
    html += '</div>';

    container.innerHTML = html;
  }

  function _profitByAgentTable(bookings) {
    var map = Stats.profitByAgent(bookings);
    var arr = [];
    for (var name in map) {
      arr.push({ agent: name, count: map[name].count, profit: map[name].profit, chargeGuest: map[name].chargeGuest, chargeCompany: map[name].chargeCompany });
    }
    arr.sort(function (a, b) { return b.profit - a.profit; });

    if (arr.length === 0) return _emptyStateMini('暫無收費記錄');

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="data-table"><thead><tr><th>代理</th><th class="num-cell">筆</th><th class="num-cell">利潤</th></tr></thead><tbody>';
    for (var i = 0; i < arr.length; i++) {
      html += '<tr><td style="font-weight:600;">' + Utils.escapeHtml(arr[i].agent) + '</td>';
      html += '<td class="num-cell">' + arr[i].count + '</td>';
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-warning);">' + Utils.formatCurrency(arr[i].profit, CURRENCY_DEFAULT) + '</td></tr>';
    }
    html += '</tbody></table></div></div>';
    return html;
  }

  function _profitByCasinoTable(bookings) {
    var map = Stats.profitByCasino(bookings);
    var arr = [];
    for (var name in map) {
      arr.push({ casino: name, count: map[name].count, profit: map[name].profit });
    }
    arr.sort(function (a, b) { return b.profit - a.profit; });

    if (arr.length === 0) return _emptyStateMini('暫無收費記錄');

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="data-table"><thead><tr><th>體系</th><th class="num-cell">筆</th><th class="num-cell">利潤</th></tr></thead><tbody>';
    for (var i = 0; i < arr.length; i++) {
      html += '<tr><td style="font-weight:600;">' + Utils.escapeHtml(arr[i].casino) + '</td>';
      html += '<td class="num-cell">' + arr[i].count + '</td>';
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-warning);">' + Utils.formatCurrency(arr[i].profit, CURRENCY_DEFAULT) + '</td></tr>';
    }
    html += '</tbody></table></div></div>';
    return html;
  }

  function _detailTable(bookings) {
    if (bookings.length === 0) return _emptyStateMini('暫無收費記錄');

    var sorted = Filters.sortBookings(bookings, _sortField, _sortAsc);

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="data-table"><thead><tr>';
    html += _th('客人', 'guestName');
    html += _th('代理', 'agent');
    html += _th('體系', 'casino');
    html += _th('入住', 'checkIn');
    html += _th('晚', 'nights', 'num-cell');
    html += _th('幣別', 'currency');
    html += '<th class="num-cell">向客人收</th>';
    html += '<th class="num-cell">交公司</th>';
    html += '<th class="num-cell">利潤</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < sorted.length; i++) {
      var b = sorted[i];
      var curr = b.currency || CURRENCY_DEFAULT;
      html += '<tr style="cursor:pointer;" onclick="viewBookingDetail(\'' + b._fbKey + '\')">';
      html += '<td style="font-weight:600;">' + Utils.escapeHtml(b.guestName || '-') + '</td>';
      html += '<td>' + Utils.escapeHtml(b.agent || '-') + '</td>';
      html += '<td>' + Utils.escapeHtml(b.casino || '-') + '</td>';
      html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(b.checkIn) + '</td>';
      html += '<td class="num-cell">' + (b.nights || 0) + '</td>';
      html += '<td><span class="currency-badge">' + Utils.escapeHtml(curr) + '</span></td>';
      html += '<td class="num-cell">' + Utils.formatCurrency(b.chargeGuest, curr) + '</td>';
      html += '<td class="num-cell">' + Utils.formatCurrency(b.chargeCompany, curr) + '</td>';
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-warning);">' + Utils.formatCurrency(b.profit, curr) + '</td>';
      html += '</tr>';
    }

    /* Totals row */
    html += '<tr style="background:var(--bg-base);font-weight:700;"><td colspan="5">合計 ' + sorted.length + ' 筆</td>';
    html += '<td></td>';
    html += '<td class="num-cell">' + Utils.formatCurrency(Stats.totalChargeGuest(sorted), CURRENCY_DEFAULT) + '</td>';
    html += '<td class="num-cell">' + Utils.formatCurrency(Stats.totalChargeCompany(sorted), CURRENCY_DEFAULT) + '</td>';
    html += '<td class="num-cell" style="color:var(--color-warning);">' + Utils.formatCurrency(Stats.totalProfit(sorted), CURRENCY_DEFAULT) + '</td>';
    html += '</tr>';

    html += '</tbody></table></div></div>';
    return html;
  }

  function _th(label, field, extraClass) {
    var cls = extraClass || '';
    var sortIcon = '';
    if (field === _sortField) {
      sortIcon = _sortAsc ? ' \u25B2' : ' \u25BC';
    }
    return '<th class="' + cls + '" style="cursor:pointer;" onclick="ProfitPage.sortBy(\'' + field + '\')">' + label + sortIcon + '</th>';
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
    sortBy: sortBy
  };
})();

function renderProfit() { ProfitPage.render(); }
