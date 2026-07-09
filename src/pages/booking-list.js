/**
 * booking-list.js — Booking List Page
 * Booking System v1.0.0
 * Renders: Filterable table with search, sort, pagination
 */
var BookingListPage = (function () {

  var _currentPage = 1;
  var _perPage = 20;
  var _sortField = '_createdAt';
  var _sortAsc = false;
  var _filterState = {};

  function render() {
    var container = document.getElementById('page-booking-list');
    if (!container) return;

    var html = '';

    // Page header
    html += '<div class="page-header">';
    html += '  <h3>訂房列表</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-primary" onclick="openBookingModal()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    html += '      新增訂房';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    // Filter bar
    html += '<div class="filter-bar">';
    html += '  <div class="filter-item">';
    html += '    <label>體系</label>';
    html += '    <select id="bl-filter-casino" onchange="BookingListPage.onFilterChange()">';
    html += '      <option value="">全部</option>';
    var casinos = Hotels.getCasinos();
    for (var i = 0; i < casinos.length; i++) {
      html += '      <option value="' + Utils.escapeHtml(casinos[i]) + '">' + Utils.escapeHtml(casinos[i]) + '</option>';
    }
    html += '    </select>';
    html += '  </div>';

    html += '  <div class="filter-item">';
    html += '    <label>狀態</label>';
    html += '    <select id="bl-filter-status" onchange="BookingListPage.onFilterChange()">';
    html += '      <option value="">全部</option>';
    html += '      <option value="pending">待確認</option>';
    html += '      <option value="confirmed">已確認</option>';
    html += '      <option value="checked-in">已入住</option>';
    html += '      <option value="checked-out">已退房</option>';
    html += '      <option value="cancelled">已取消</option>';
    html += '    </select>';
    html += '  </div>';

    html += '  <div class="filter-item">';
    html += '    <label>代理</label>';
    html += '    <select id="bl-filter-agent" onchange="BookingListPage.onFilterChange()">';
    html += '      <option value="">全部</option>';
    var agentNames = Agents.getNames();
    for (var a = 0; a < agentNames.length; a++) {
      html += '      <option value="' + Utils.escapeHtml(agentNames[a]) + '">' + Utils.escapeHtml(agentNames[a]) + '</option>';
    }
    html += '    </select>';
    html += '  </div>';

    html += '  <div class="filter-spacer"></div>';

    html += '  <div class="search-box" style="width:220px;">';
    html += '    <svg class="search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>';
    html += '    <input type="text" id="bl-search" placeholder="搜索客人/酒店/手機..." oninput="BookingListPage.onSearchChange(this.value)">';
    html += '    <div class="search-clear" onclick="BookingListPage.clearSearch()"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div>';
    html += '  </div>';
    html += '</div>';

    // Data table
    var month = State.get('workingMonth') || Utils.getCurrentMonth();
    var criteria = Utils.deepClone(_filterState);
    criteria.month = month;

    var filtered = Filters.filterBookings(Bookings.getAll(), criteria);
    var sorted = Filters.sortBookings(filtered, _sortField, _sortAsc);
    var total = sorted.length;
    var totalPages = Math.max(1, Math.ceil(total / _perPage));
    if (_currentPage > totalPages) _currentPage = totalPages;
    var pageData = Filters.paginate(sorted, _currentPage, _perPage);

    html += '<div class="data-table-wrap">';
    html += '  <div class="data-table-scroll scroll-hint' + (total > 0 ? ' scrollable' : '') + '">';
    html += '    <table class="data-table">';
    html += '      <thead><tr>';
    html += _th('客人', 'guestName');
    html += _th('體系', 'casino');
    html += _th('酒店/房型', 'hotel');
    html += _th('入住', 'checkIn');
    html += _th('退房', 'checkOut');
    html += _th('晚', 'nights', 'num-cell');
    html += _th('房數', 'roomCount', 'num-cell');
    html += _th('代理', 'agent');
    html += _th('狀態', 'status');
    html += _th('補償', 'compType');
    html += '<th class="action-cell">操作</th>';
    html += '      </tr></thead>';
    html += '      <tbody>';

    if (pageData.length === 0) {
      html += '<tr><td colspan="11" style="text-align:center;padding:var(--sp-12);color:var(--text-muted);">暫無訂房記錄，點擊「新增訂房」開始</td></tr>';
    } else {
      for (var i = 0; i < pageData.length; i++) {
        html += _bookingRow(pageData[i]);
      }
    }

    html += '      </tbody>';
    html += '    </table>';
    html += '  </div>';
    html += '</div>';

    // Pagination
    if (total > _perPage) {
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--sp-4);">';
      html += '  <span style="font-size:var(--fs-sm);color:var(--text-muted);">共 ' + total + ' 筆，第 ' + _currentPage + '/' + totalPages + ' 頁</span>';
      html += '  <div style="display:flex;gap:var(--sp-2);">';
      html += '    <button class="btn btn-secondary btn-sm" ' + (_currentPage <= 1 ? 'disabled' : '') + ' onclick="BookingListPage.goPage(' + (_currentPage - 1) + ')">上一頁</button>';
      html += '    <button class="btn btn-secondary btn-sm" ' + (_currentPage >= totalPages ? 'disabled' : '') + ' onclick="BookingListPage.goPage(' + (_currentPage + 1) + ')">下一頁</button>';
      html += '  </div>';
    }

    container.innerHTML = html;

    // Update search clear button visibility
    _updateSearchClear();
  }

  function _th(label, field, extraClass) {
    var cls = extraClass || '';
    var sortIcon = '';
    if (field === _sortField) {
      sortIcon = _sortAsc ? ' ▲' : ' ▼';
    }
    return '<th class="' + cls + '" style="cursor:pointer;" onclick="BookingListPage.sortBy(\'' + field + '\')">' + label + sortIcon + '</th>';
  }

  function _bookingRow(b) {
    var html = '<tr>';
    html += '<td style="font-weight:600;">' + Utils.escapeHtml(b.guestName || '-') + '</td>';
    html += '<td>' + Utils.escapeHtml(b.casino || '-') + '</td>';
    html += '<td><div style="font-size:var(--fs-sm);">' + Utils.escapeHtml(b.hotel || '-') + '</div><div style="font-size:var(--fs-xs);color:var(--text-muted);">' + Utils.escapeHtml(b.roomType || '') + '</div></td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(b.checkIn) + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(b.checkOut) + '</td>';
    html += '<td class="num-cell">' + (b.nights || 0) + '</td>';
    html += '<td class="num-cell">' + (b.roomCount || 1) + '</td>';
    html += '<td>' + Utils.escapeHtml(b.agent || '-') + '</td>';
    html += '<td>' + Utils.statusBadge(b.status) + '</td>';
    html += '<td><span class="comp-badge ' + (b.compType || 'free-room') + '">' + Utils.escapeHtml(COMP_TYPE_LABELS[b.compType] || b.compType || '-') + '</span></td>';
    html += '<td class="action-cell">';
    html += '  <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();viewBookingDetail(\'' + b._fbKey + '\')" data-tooltip="查看">查看</button>';
    html += '  <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();editBooking(\'' + b._fbKey + '\')" data-tooltip="編輯">編輯</button>';
    html += '  <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteBooking(\'' + b._fbKey + '\')" data-tooltip="刪除">刪除</button>';
    html += '</td>';
    html += '</tr>';
    return html;
  }

  // Public methods for filter interactions
  function onFilterChange() {
    _currentPage = 1;
    var casinoEl = document.getElementById('bl-filter-casino');
    var statusEl = document.getElementById('bl-filter-status');
    var agentEl = document.getElementById('bl-filter-agent');
    _filterState = {};
    if (casinoEl && casinoEl.value) _filterState.casino = casinoEl.value;
    if (statusEl && statusEl.value) _filterState.status = statusEl.value;
    if (agentEl && agentEl.value) _filterState.agent = agentEl.value;
    render();
  }

  function onSearchChange(val) {
    _currentPage = 1;
    _filterState.keyword = val || '';
    render();
    // Restore focus to search
    var search = document.getElementById('bl-search');
    if (search) {
      search.focus();
      search.setSelectionRange(search.value.length, search.value.length);
    }
  }

  function clearSearch() {
    _filterState.keyword = '';
    _currentPage = 1;
    render();
  }

  function _updateSearchClear() {
    var box = document.querySelector('.search-box');
    var input = document.getElementById('bl-search');
    if (box && input) {
      if (input.value) box.classList.add('has-value');
      else box.classList.remove('has-value');
    }
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

  return {
    render: render,
    onFilterChange: onFilterChange,
    onSearchChange: onSearchChange,
    clearSearch: clearSearch,
    sortBy: sortBy,
    goPage: goPage
  };
})();

// Global alias
function renderBookingList() { BookingListPage.render(); }
