/**
 * calendar.js — Calendar View Page
 * Booking System v1.0.0
 * Renders: Monthly calendar with booking chips on each day
 */
var CalendarPage = (function () {

  function render() {
    var container = document.getElementById('page-calendar');
    if (!container) return;

    var monthStr = State.get('workingMonth') || Utils.getCurrentMonth();
    var parts = monthStr.split('-');
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10) - 1; // 0-indexed

    var allBookings = Bookings.getAll();
    var monthBookings = Filters.filterBookings(allBookings, { month: monthStr });

    var html = '';

    // Page header
    html += '<div class="page-header">';
    html += '  <h3>日曆視圖 — ' + monthStr + '</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-secondary" onclick="prevMonth()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
    html += '      上月';
    html += '    </button>';
    html += '    <button class="btn btn-secondary" onclick="nextMonth()">下月';
    html += '      <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    // Calendar grid
    html += '<div class="calendar-grid">';

    // Day headers
    var dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    for (var d = 0; d < 7; d++) {
      var weekendClass = (d === 0 || d === 6) ? ' weekend' : '';
      html += '<div class="calendar-header-cell' + weekendClass + '">' + dayNames[d] + '</div>';
    }

    // Calculate first day of month and total days
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = Utils.getMonthDays(year, month);

    // Today
    var todayStr = Utils.formatDate(new Date());

    // Build day cells
    // Previous month padding
    var prevMonthDays = Utils.getMonthDays(year, month - 1);
    for (var p = firstDay - 1; p >= 0; p--) {
      var prevDay = prevMonthDays - p;
      html += '<div class="calendar-cell other-month"><span class="calendar-day-num">' + prevDay + '</span></div>';
    }

    // Current month days
    for (var day = 1; day <= daysInMonth; day++) {
      var dateStr = year + '-' + Utils.pad(month + 1) + '-' + Utils.pad(day);
      var dow = new Date(year, month, day).getDay();
      var isWeekend = (dow === 0 || dow === 6);
      var isToday = (dateStr === todayStr);

      var classes = 'calendar-cell';
      if (isWeekend) classes += ' weekend';
      if (isToday) classes += ' today';

      html += '<div class="' + classes + '" onclick="openBookingModal(\'' + dateStr + '\')">';
      html += '<span class="calendar-day-num">' + day + '</span>';

      // Find bookings for this date
      var dayBookings = Filters.filterByDate(monthBookings, dateStr);
      for (var b = 0; b < Math.min(dayBookings.length, 3); b++) {
        var bk = dayBookings[b];
        var chipText = Utils.escapeHtml(bk.guestName || bk.hotel || '訂房');
        html += '<div class="calendar-booking-chip status-' + bk.status + '" onclick="event.stopPropagation();viewBookingDetail(\'' + bk._fbKey + '\')" title="' + Utils.escapeHtml(bk.guestName + ' / ' + bk.hotel) + '">';
        html += chipText;
        html += '</div>';
      }
      if (dayBookings.length > 3) {
        html += '<div class="calendar-booking-chip" style="color:var(--text-muted);">+' + (dayBookings.length - 3) + '</div>';
      }

      html += '</div>';
    }

    // Next month padding
    var totalCells = firstDay + daysInMonth;
    var remaining = (7 - (totalCells % 7)) % 7;
    for (var n = 1; n <= remaining; n++) {
      html += '<div class="calendar-cell other-month"><span class="calendar-day-num">' + n + '</span></div>';
    }

    html += '</div>';

    // Legend
    html += '<div style="display:flex;gap:var(--sp-4);margin-top:var(--sp-4);flex-wrap:wrap;">';
    html += _legendItem('pending', '待確認');
    html += _legendItem('confirmed', '已確認');
    html += _legendItem('checked-in', '已入住');
    html += _legendItem('checked-out', '已退房');
    html += _legendItem('cancelled', '已取消');
    html += '</div>';

    container.innerHTML = html;
  }

  function _legendItem(status, label) {
    return '<div style="display:flex;align-items:center;gap:6px;font-size:var(--fs-xs);color:var(--text-secondary);">' +
           '<span class="calendar-booking-chip status-' + status + '" style="width:20px;height:12px;padding:0;"></span>' +
           Utils.escapeHtml(label) +
           '</div>';
  }

  return { render: render };
})();

// Global alias
function renderCalendar() { CalendarPage.render(); }
