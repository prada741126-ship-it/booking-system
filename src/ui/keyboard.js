/**
 * keyboard.js — Keyboard Shortcuts Manager
 * Booking System v1.0.0
 * Pattern: reused from v13.0.5
 */
var Keyboard = (function () {
  var _initialized = false;
  var _helpModalOpen = false;

  function init() {
    if (_initialized) return;
    _initialized = true;

    document.addEventListener('keydown', _handleKeyDown);
    console.log('[Keyboard] Shortcuts initialized');
  }

  function _handleKeyDown(e) {
    // Don't intercept when typing in input/textarea/select
    var tag = e.target.tagName.toLowerCase();
    var isInput = tag === 'input' || tag === 'textarea' || tag === 'select';

    // Ctrl+S and Ctrl+N work even in inputs
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case '1':
          e.preventDefault();
          Router.switchTo(PAGES.OVERVIEW);
          break;
        case '2':
          e.preventDefault();
          Router.switchTo(PAGES.CALENDAR);
          break;
        case '3':
          e.preventDefault();
          Router.switchTo(PAGES.BOOKING_LIST);
          break;
        case '4':
          e.preventDefault();
          Router.switchTo(PAGES.STATS);
          break;
        case '5':
          e.preventDefault();
          Router.switchTo(PAGES.BOT_LOG);
          break;
        case 'n':
          e.preventDefault();
          _openBookingModal();
          break;
        case 's':
          e.preventDefault();
          _triggerSync();
          break;
        case 'f':
          if (!isInput) {
            e.preventDefault();
            _focusSearch();
          }
          break;
      }
      return;
    }

    // Non-ctrl shortcuts (only when not typing)
    if (isInput) return;

    switch (e.key) {
      case '?':
        e.preventDefault();
        _toggleHelpModal();
        break;
      case 'Escape':
        _closeAllModals();
        break;
    }
  }

  function _openBookingModal() {
    if (typeof openBookingModal === 'function') {
      openBookingModal();
    } else {
      Events.emit(EVENTS.UI_MODAL_OPEN, { type: 'booking' });
    }
  }

  function _triggerSync() {
    if (typeof syncUploadAll === 'function') {
      syncUploadAll(function () {
        if (typeof showToast === 'function') {
          showToast('同步完成', 'success');
        }
      });
    }
  }

  function _focusSearch() {
    var searchInput = document.querySelector('.search-box input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  function _toggleHelpModal() {
    var modal = document.getElementById('shortcut-help-modal');
    if (!modal) {
      _createHelpModal();
      modal = document.getElementById('shortcut-help-modal');
    }
    if (_helpModalOpen) {
      _closeHelpModal();
    } else {
      _openHelpModal();
    }
  }

  function _createHelpModal() {
    var overlay = document.createElement('div');
    overlay.id = 'shortcut-help-modal';
    overlay.className = 'modal-overlay';

    var items = SHORTCUTS.map(function (s) {
      return '<div class="shortcut-item">' +
        '<span class="shortcut-action">' + s.action + '</span>' +
        '<span class="shortcut-key">' + s.keys + '</span>' +
        '</div>';
    }).join('');

    overlay.innerHTML =
      '<div class="modal modal-sm">' +
      '  <div class="modal-header">' +
      '    <h3>快捷鍵一覽</h3>' +
      '    <button class="modal-close" onclick="Keyboard.closeHelp()">' +
      '      <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
      '    </button>' +
      '  </div>' +
      '  <div class="modal-body">' +
      '    <div class="shortcut-list">' + items + '</div>' +
      '  </div>' +
      '</div>';

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) _closeHelpModal();
    });

    document.body.appendChild(overlay);
  }

  function _openHelpModal() {
    var modal = document.getElementById('shortcut-help-modal');
    if (modal) {
      modal.classList.add('visible');
      _helpModalOpen = true;
    }
  }

  function _closeHelpModal() {
    var modal = document.getElementById('shortcut-help-modal');
    if (modal) {
      modal.classList.remove('visible');
      _helpModalOpen = false;
    }
  }

  function _closeAllModals() {
    // Close help modal
    _closeHelpModal();

    // Close any open modal-overlay
    var modals = document.querySelectorAll('.modal-overlay.visible');
    for (var i = 0; i < modals.length; i++) {
      modals[i].classList.remove('visible');
    }

    // Close sidebar on mobile
    var sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');

    var backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('visible');

    Events.emit(EVENTS.UI_MODAL_CLOSE);
  }

  return {
    init: init,
    closeHelp: _closeHelpModal
  };
})();
