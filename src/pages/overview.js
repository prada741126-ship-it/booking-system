/**
 * overview.js — Overview / Dashboard Page
 * Booking System v1.0.0
 * Renders: KPI cards + recent bookings + status distribution
 */
var OverviewPage = (function () {

  function render() {
    var container = document.getElementById('page-overview');
    if (!container) return;

    var month = State.get('workingMonth') || Utils.getCurrentMonth();
    var allBookings = Bookings.getAll();
    var monthBookings = Filters.filterBookings(allBookings, { month: month });

    // Calculate stats
    var total = Stats.totalBookings(monthBookings);
    var totalRooms = Stats.totalRooms(monthBookings);
    var totalNights = Stats.totalRoomNights(monthBookings);
    var totalGuests = Stats.totalGuests(monthBookings);
    var totalThreshold = Stats.totalThreshold(monthBookings);
    var totalVolume = Stats.totalVolume(monthBookings);
    var thresholdRate = Stats.thresholdRate(monthBookings);
    var statusCounts = Stats.countByStatus(monthBookings);

    // Status counts
    var pending = statusCounts['pending'] || 0;
    var confirmed = statusCounts['confirmed'] || 0;
    var checkedIn = statusCounts['checked-in'] || 0;
    var checkedOut = statusCounts['checked-out'] || 0;
    var cancelled = statusCounts['cancelled'] || 0;

    var html = '';

    // Page header
    html += '<div class="page-header">';
    html += '  <h3>總覽</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-primary" onclick="openBookingModal()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    html += '      新增訂房';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    // KPI Cards
    html += '<div class="kpi-grid">';

    // Total bookings
    html += _kpiCard('kpi-cyan', '本月訂房數', total, '間', '本月所有訂房記錄',
      '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>');

    // Total rooms
    html += _kpiCard('kpi-violet', '總房間數', totalRooms, '間', '所有訂房房間總和',
      '<svg viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>');

    // Total nights
    html += _kpiCard('kpi-gold', '總房晚數', totalNights, '晚', '房間數 × 晚數',
      '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>');

    // Threshold rate
    var rateClass = thresholdRate >= 100 ? 'kpi-success' : 'kpi-danger';
    html += _kpiCard(rateClass, '門檻達成率', thresholdRate.toFixed(1), '%',
      '洗碼量 / 門檻 × 100%',
      '<svg viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>');

    html += '</div>';

    // Second row: status distribution + recent bookings
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4);margin-bottom:var(--sp-6);">';

    // Status distribution card
    html += '<div class="card">';
    html += '  <div class="card-title">';
    html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg></div>';
    html += '    狀態分佈';
    html += '  </div>';
    html += _statusRow('待確認', pending, total, UI_COLORS.warning);
    html += _statusRow('已確認', confirmed, total, UI_COLORS.techCyan);
    html += _statusRow('已入住', checkedIn, total, UI_COLORS.success);
    html += _statusRow('已退房', checkedOut, total, UI_COLORS.textMuted);
    html += _statusRow('已取消', cancelled, total, UI_COLORS.danger);
    html += '</div>';

    // Recent bookings card
    html += '<div class="card">';
    html += '  <div class="card-title">';
    html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg></div>';
    html += '    最近訂房';
    html += '  </div>';

    var recent = Filters.sortBookings(monthBookings, '_createdAt', false).slice(0, 5);
    if (recent.length === 0) {
      html += _emptyStateMini('暫無訂房記錄');
    } else {
      for (var i = 0; i < recent.length; i++) {
        html += _recentBookingRow(recent[i]);
      }
    }
    html += '</div>';

    html += '</div>'; // end grid

    // Volume vs Threshold section
    if (totalThreshold > 0 || totalVolume > 0) {
      html += '<div class="card">';
      html += '  <div class="card-title">';
      html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg></div>';
      html += '    洗碼量 vs 門檻';
      html += '  </div>';
      html += _progressRow('總洗碼量', totalVolume, totalThreshold, Utils.formatNumber(totalVolume), Utils.formatNumber(totalThreshold));
      html += '</div>';
    }

    container.innerHTML = html;
  }

  function _kpiCard(colorClass, label, value, unit, sub, iconSvg) {
    var html = '<div class="kpi-card ' + colorClass + '">';
    html += '  <div class="kpi-header">';
    html += '    <span class="kpi-label">' + label + '</span>';
    html += '    <div class="kpi-icon">' + iconSvg + '</div>';
    html += '  </div>';
    html += '  <div class="kpi-value tabular-nums">' + value + '</div>';
    if (unit) html += '  <span class="kpi-sub">' + unit + ' — ' + Utils.escapeHtml(sub) + '</span>';
    html += '</div>';
    return html;
  }

  function _statusRow(label, count, total, color) {
    var pct = total > 0 ? (count / total * 100) : 0;
    var html = '<div class="stat-row">';
    html += '  <span class="stat-label" style="display:flex;align-items:center;gap:6px;">';
    html += '    <span style="width:8px;height:8px;border-radius:50%;background:' + color + ';"></span>';
    html += '    ' + Utils.escapeHtml(label);
    html += '  </span>';
    html += '  <span class="stat-value">' + count + ' <span style="color:var(--text-muted);font-weight:400;font-size:var(--fs-xs);">(' + pct.toFixed(0) + '%)</span></span>';
    html += '</div>';
    return html;
  }

  function _recentBookingRow(b) {
    var html = '<div class="stat-row" style="cursor:pointer;" onclick="viewBookingDetail(\'' + b._fbKey + '\')">';
    html += '  <div>';
    html += '    <div style="font-weight:600;font-size:var(--fs-sm);">' + Utils.escapeHtml(b.guestName || '未知') + '</div>';
    html += '    <div style="font-size:var(--fs-xs);color:var(--text-muted);">' + Utils.escapeHtml(b.casino + ' / ' + (b.hotel || '')) + '</div>';
    html += '  </div>';
    html += '  <div style="text-align:right;">';
    html += '    ' + Utils.statusBadge(b.status);
    html += '    <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:2px;">' + Utils.formatDateDisplay(b.checkIn) + '</div>';
    html += '  </div>';
    html += '</div>';
    return html;
  }

  function _progressRow(label, current, target, currentStr, targetStr) {
    var pct = target > 0 ? Math.min(100, (current / target * 100)) : 0;
    var fillClass = pct >= 100 ? 'success' : pct >= 50 ? '' : 'warning';
    var html = '<div style="margin-bottom:var(--sp-4);">';
    html += '  <div style="display:flex;justify-content:space-between;margin-bottom:var(--sp-2);">';
    html += '    <span class="stat-label">' + Utils.escapeHtml(label) + '</span>';
    html += '    <span class="stat-value">' + currentStr + ' / ' + targetStr + '</span>';
    html += '  </div>';
    html += '  <div class="progress-bar"><div class="progress-fill ' + fillClass + '" style="width:' + pct + '%;"></div></div>';
    html += '</div>';
    return html;
  }

  function _emptyStateMini(text) {
    return '<div style="padding:var(--sp-6);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">' +
           Utils.escapeHtml(text) + '</div>';
  }

  return { render: render };
})();

// Global alias
function renderOverview() { OverviewPage.render(); }
