/**
 * paginator.js — Generic Table Pagination + Search + Sort + Expand helpers
 * Booking System v2.2.0
 * Provides: filter/search, sort, page slice, nav rendering, search box, sortable TH, expand toggle
 * Each page module keeps its own state (_page, _search, _sortField, _sortAsc, _expandAll)
 * and calls these helpers during render.
 */
var Paginator = (function () {
  var PAGE_SIZE = 10;

  /* ===== Data helpers (pure functions) ===== */

  /** Filter bookings by search term across guestName, agent, hotel */
  function filterBySearch(bookings, term) {
    if (!term) return bookings.slice();
    var t = term.toLowerCase();
    return bookings.filter(function (b) {
      return (b.guestName || '').toLowerCase().indexOf(t) !== -1 ||
             (b.agent || '').toLowerCase().indexOf(t) !== -1 ||
             (b.hotel || '').toLowerCase().indexOf(t) !== -1 ||
             (b.casino || '').toLowerCase().indexOf(t) !== -1;
    });
  }

  /** Sort bookings by field (checkIn, guestName, agent, hotel, _createdAt) */
  function sortBy(bookings, field, asc) {
    var sorted = bookings.slice();
    sorted.sort(function (a, b) {
      var va, vb;
      if (field === 'checkIn') {
        va = (a.checkIn || '');
        vb = (b.checkIn || '');
      } else if (field === 'guestName') {
        va = (a.guestName || '').toLowerCase();
        vb = (b.guestName || '').toLowerCase();
      } else if (field === 'agent') {
        va = (a.agent || '').toLowerCase();
        vb = (b.agent || '').toLowerCase();
      } else if (field === 'hotel') {
        va = (a.hotel || '').toLowerCase();
        vb = (b.hotel || '').toLowerCase();
      } else if (field === '_createdAt') {
        va = a._createdAt || 0;
        vb = b._createdAt || 0;
      } else {
        va = (a[field] !== undefined ? String(a[field]) : '').toLowerCase();
        vb = (b[field] !== undefined ? String(b[field]) : '').toLowerCase();
      }
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      /* Secondary sort by checkIn desc for tie-breaking */
      var ca = (a.checkIn || '');
      var cb = (b.checkIn || '');
      return ca < cb ? 1 : ca > cb ? -1 : 0;
    });
    return sorted;
  }

  /** Get a page slice from sorted array */
  function getPage(sorted, pageNum, expandAll) {
    if (expandAll) return sorted;
    var start = (pageNum - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }

  /** Calculate total pages */
  function totalPages(sorted, expandAll) {
    if (expandAll || sorted.length === 0) return 1;
    return Math.ceil(sorted.length / PAGE_SIZE);
  }

  /* ===== HTML rendering helpers ===== */

  /** Render search box HTML.
   *  onSearchFn: name of the page's search handler function (e.g. 'FeesPage.onSearch') */
  function renderSearch(term, onSearchFn, placeholder) {
    var ph = placeholder || '搜索客人姓名、代理...';
    var escFn = onSearchFn || '';
    var html = '<div class="search-box" style="margin-bottom:var(--sp-3);">';
    html += '<svg class="search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>';
    html += '<input type="text" class="form-control" id="paginator-search-input" placeholder="' + Utils.escapeHtml(ph) + '" value="' + Utils.escapeHtml(term || '') + '" oninput="var el=this;clearTimeout(el._t);el._t=setTimeout(function(){' + escFn + '(el.value);},400);" oncompositionend="var el=this;clearTimeout(el._t);setTimeout(function(){' + escFn + '(el.value);},0);">';
    if (term) {
      html += '<span class="search-clear" style="display:flex;cursor:pointer;" onclick="' + escFn + '(\'\')"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></span>';
    }
    html += '</div>';
    return html;
  }

  /** Render page navigation bar
   *  onClickPage: function name that takes page number, e.g. 'FeesPage.goPage' */
  function renderNav(currentPage, totalPages, totalItems, onClickPage) {
    if (totalPages <= 1) return '';

    var fn = onClickPage || '';
    var html = '<div class="paginator-nav">';
    html += '<span class="paginator-info">第 ' + currentPage + '/' + totalPages + ' 頁，共 ' + totalItems + ' 筆</span>';
    html += '<div class="paginator-btns">';

    /* Prev */
    if (currentPage > 1) {
      html += '<button class="paginator-btn" onclick="' + fn + '(' + (currentPage - 1) + ')">上一頁</button>';
    } else {
      html += '<button class="paginator-btn paginator-btn-disabled" disabled>上一頁</button>';
    }

    /* Page numbers */
    var startPage = Math.max(1, currentPage - 2);
    var endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      html += '<button class="paginator-btn" onclick="' + fn + '(1)">1</button>';
      if (startPage > 2) html += '<span class="paginator-ellipsis">...</span>';
    }

    for (var p = startPage; p <= endPage; p++) {
      if (p === currentPage) {
        html += '<button class="paginator-btn paginator-btn-active">' + p + '</button>';
      } else {
        html += '<button class="paginator-btn" onclick="' + fn + '(' + p + ')">' + p + '</button>';
      }
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += '<span class="paginator-ellipsis">...</span>';
      html += '<button class="paginator-btn" onclick="' + fn + '(' + totalPages + ')">' + totalPages + '</button>';
    }

    /* Next */
    if (currentPage < totalPages) {
      html += '<button class="paginator-btn" onclick="' + fn + '(' + (currentPage + 1) + ')">下一頁</button>';
    } else {
      html += '<button class="paginator-btn paginator-btn-disabled" disabled>下一頁</button>';
    }

    html += '</div></div>';
    return html;
  }

  /** Render expand/collapse toggle button */
  function renderExpandToggle(expanded, onClickFn) {
    var fn = onClickFn || '';
    return '<button class="paginator-expand-btn' + (expanded ? ' active' : '') + '" onclick="' + fn + '(' + (expanded ? 'false' : 'true') + ')">' +
      (expanded ? '切換分頁' : '全部展開') + '</button>';
  }

  /** Render sortable table header <th>.
   *  Returns HTML string with onclick for sorting.
   *  currentField: the currently sorted field
   *  currentAsc: current sort direction
   *  sortFn: function name, e.g. 'FeesPage.sortBy' */
  function renderTH(label, field, currentField, currentAsc, sortFn, extraClass) {
    var fn = sortFn || '';
    var cls = extraClass ? ' ' + extraClass : '';
    var arrow = '';
    if (field === currentField) {
      arrow = currentAsc ? ' ▲' : ' ▼';
    }
    return '<th class="sortable-th' + cls + '" onclick="' + fn + '(\'' + field + '\')" style="cursor:pointer;">' +
      Utils.escapeHtml(label) + '<span class="sort-arrow">' + arrow + '</span></th>';
  }

  /** Build a toolbar row with search + expand toggle */
  function renderToolbar(searchHTML, expandHTML) {
    return '<div style="display:flex;align-items:center;gap:var(--sp-3);">' +
      '<div style="flex:1;">' + searchHTML + '</div>' +
      expandHTML +
      '</div>';
  }

  /* ===== Exports ===== */
  return {
    PAGE_SIZE: PAGE_SIZE,
    filterBySearch: filterBySearch,
    sortBy: sortBy,
    getPage: getPage,
    totalPages: totalPages,
    renderSearch: renderSearch,
    renderNav: renderNav,
    renderExpandToggle: renderExpandToggle,
    renderTH: renderTH,
    renderToolbar: renderToolbar
  };
})();
