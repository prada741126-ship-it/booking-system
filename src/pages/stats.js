/**
 * stats.js — Statistics Page
 * Booking System v1.0.0
 * Renders: Casino matrix + Agent matrix + Transfer stats + Top rankings
 */
var StatsPage = (function () {

  function render() {
    var container = document.getElementById('page-stats');
    if (!container) return;

    var month = State.get('workingMonth') || Utils.getCurrentMonth();
    var monthBookings = Filters.filterBookings(Bookings.getAll(), { month: month });

    var html = '';

    // Page header
    html += '<div class="page-header">';
    html += '  <h3>統計分析 — ' + month + '</h3>';
    html += '</div>';

    // KPI summary
    var total = Stats.totalBookings(monthBookings);
    var totalRooms = Stats.totalRooms(monthBookings);
    var totalNights = Stats.totalRoomNights(monthBookings);
    var totalThreshold = Stats.totalThreshold(monthBookings);
    var totalVolume = Stats.totalVolume(monthBookings);
    var totalCost = Stats.totalCost(monthBookings);

    html += '<div class="kpi-grid">';
    html += _kpiCard('kpi-cyan', '訂房總數', total, '');
    html += _kpiCard('kpi-violet', '房間總數', totalRooms, '');
    html += _kpiCard('kpi-gold', '總房晚', totalNights, '');
    html += _kpiCard('kpi-success', '總洗碼量', Utils.formatNumber(totalVolume), '');
    html += _kpiCard('kpi-danger', '總門檻', Utils.formatNumber(totalThreshold), '');
    html += '</div>';

    // Casino × Status matrix
    html += '<div class="card" style="margin-bottom:var(--sp-4);">';
    html += '  <div class="card-title">';
    html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg></div>';
    html += '    體系 × 狀態 矩陣';
    html += '  </div>';
    html += _casinoMatrixTable(monthBookings);
    html += '</div>';

    // Agent × Casino matrix
    html += '<div class="card" style="margin-bottom:var(--sp-4);">';
    html += '  <div class="card-title">';
    html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>';
    html += '    代理 × 體系 矩陣';
    html += '  </div>';
    html += _agentMatrixTable(monthBookings);
    html += '</div>';

    // Two columns: Transfer stats + Top agents
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4);">';

    // Transfer stats
    html += '<div class="card">';
    html += '  <div class="card-title">';
    html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>';
    html += '    接送統計';
    html += '  </div>';
    var transferStats = Stats.transferStats(monthBookings);
    var transferLabels = { none: '無', airport: '機場接送', ferry: '碼頭接送', both: '機場+碼頭', custom: '自定義' };
    for (var tKey in transferStats) {
      html += _statRow(transferLabels[tKey] || tKey, transferStats[tKey]);
    }
    html += '</div>';

    // Top agents
    html += '<div class="card">';
    html += '  <div class="card-title">';
    html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg></div>';
    html += '    代理排行 (TOP 5)';
    html += '  </div>';
    var topAgents = Stats.topAgents(monthBookings, 5);
    if (topAgents.length === 0) {
      html += _emptyStateMini('暫無數據');
    } else {
      for (var i = 0; i < topAgents.length; i++) {
        var rank = i + 1;
        var rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
        html += '<div class="stat-row">';
        html += '  <span class="stat-label">' + rankIcon + ' ' + Utils.escapeHtml(topAgents[i].agent) + '</span>';
        html += '  <span class="stat-value">' + topAgents[i].count + ' 筆</span>';
        html += '</div>';
      }
    }
    html += '</div>';

    html += '</div>'; // end grid

    container.innerHTML = html;
  }

  function _casinoMatrixTable(bookings) {
    var matrix = Stats.casinoMatrix(bookings);
    var casinos = CASINO_ORDER.slice();

    // Add any casinos not in preset
    for (var c in matrix) {
      if (casinos.indexOf(c) === -1) casinos.push(c);
    }

    var statuses = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];
    var statusLabels = BOOKING_STATUS_LABELS;

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="data-table"><thead><tr><th>體系</th>';
    for (var s = 0; s < statuses.length; s++) {
      html += '<th class="num-cell">' + Utils.escapeHtml(statusLabels[statuses[s]]) + '</th>';
    }
    html += '<th class="num-cell">合計</th></tr></thead><tbody>';

    var grandTotal = 0;
    for (var i = 0; i < casinos.length; i++) {
      var casino = casinos[i];
      var row = matrix[casino];
      if (!row) continue;
      html += '<tr><td style="font-weight:600;">' + Utils.escapeHtml(casino) + '</td>';
      for (var j = 0; j < statuses.length; j++) {
        var count = row[statuses[j]] || 0;
        html += '<td class="num-cell">' + (count || '-') + '</td>';
      }
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-tech-cyan);">' + (row._total || 0) + '</td>';
      html += '</tr>';
      grandTotal += (row._total || 0);
    }

    // Totals row
    html += '<tr style="background:var(--bg-elevated);font-weight:700;"><td>合計</td>';
    for (var k = 0; k < statuses.length; k++) {
      var statusTotal = 0;
      for (var ci = 0; ci < casinos.length; ci++) {
        if (matrix[casinos[ci]]) {
          statusTotal += (matrix[casinos[ci]][statuses[k]] || 0);
        }
      }
      html += '<td class="num-cell">' + (statusTotal || '-') + '</td>';
    }
    html += '<td class="num-cell" style="color:var(--color-tech-cyan);">' + grandTotal + '</td>';
    html += '</tr>';

    html += '</tbody></table></div></div>';
    return html;
  }

  function _agentMatrixTable(bookings) {
    var matrix = Stats.agentMatrix(bookings);
    var agents = [];
    for (var a in matrix) {
      agents.push({ name: a, total: matrix[a]._total || 0 });
    }
    agents.sort(function (x, y) { return y.total - x.total; });

    var casinos = CASINO_ORDER.slice();
    for (var c in matrix) {
      for (var ck in matrix[c]) {
        if (ck !== '_total' && casinos.indexOf(ck) === -1) casinos.push(ck);
      }
    }

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="data-table"><thead><tr><th>代理</th>';
    for (var i = 0; i < casinos.length; i++) {
      html += '<th class="num-cell">' + Utils.escapeHtml(casinos[i]) + '</th>';
    }
    html += '<th class="num-cell">合計</th></tr></thead><tbody>';

    for (var j = 0; j < agents.length; j++) {
      var agentName = agents[j].name;
      var row = matrix[agentName];
      html += '<tr><td style="font-weight:600;">' + Utils.escapeHtml(agentName) + '</td>';
      for (var ci2 = 0; ci2 < casinos.length; ci2++) {
        var count = row[casinos[ci2]] || 0;
        html += '<td class="num-cell">' + (count || '-') + '</td>';
      }
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-tech-cyan);">' + (row._total || 0) + '</td>';
      html += '</tr>';
    }

    if (agents.length === 0) {
      html += '<tr><td colspan="' + (casinos.length + 2) + '" style="text-align:center;padding:var(--sp-6);color:var(--text-muted);">暫無數據</td></tr>';
    }

    html += '</tbody></table></div></div>';
    return html;
  }

  function _kpiCard(colorClass, label, value, unit) {
    return '<div class="kpi-card ' + colorClass + '">' +
      '<div class="kpi-header"><span class="kpi-label">' + label + '</span></div>' +
      '<div class="kpi-value tabular-nums">' + value + '</div>' +
      (unit ? '<span class="kpi-sub">' + unit + '</span>' : '') +
      '</div>';
  }

  function _statRow(label, value) {
    return '<div class="stat-row"><span class="stat-label">' + Utils.escapeHtml(label) + '</span><span class="stat-value">' + value + '</span></div>';
  }

  function _emptyStateMini(text) {
    return '<div style="padding:var(--sp-6);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">' + Utils.escapeHtml(text) + '</div>';
  }

  return { render: render };
})();

// Global alias
function renderStats() { StatsPage.render(); }
