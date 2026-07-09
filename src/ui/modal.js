/**
 * modal.js — Modal Dialog System
 * Booking System v1.0.0
 * Pattern: reused from v13.0.5
 * Features: open/close, form hosting, backdrop click, escape
 */
var Modal = (function () {
  var _activeModal = null;

  /**
   * Open a modal with given HTML content
   * @param {Object} opts - { title, body, footer, size, onClose }
   */
  function open(opts) {
    opts = opts || {};

    // Close any existing modal first
    close();

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    var sizeClass = opts.size === 'lg' ? ' modal-lg' :
                    opts.size === 'sm' ? ' modal-sm' : '';

    overlay.innerHTML =
      '<div class="modal' + sizeClass + '">' +
      '  <div class="modal-header">' +
      '    <h3>' + Utils.escapeHtml(opts.title || '') + '</h3>' +
      '    <button class="modal-close" data-modal-close>' +
      '      <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
      '    </button>' +
      '  </div>' +
      '  <div class="modal-body">' + (opts.body || '') + '</div>' +
      (opts.footer ? '<div class="modal-footer">' + opts.footer + '</div>' : '') +
      '</div>';

    document.body.appendChild(overlay);
    _activeModal = { el: overlay, onClose: opts.onClose };

    // Trigger animation
    requestAnimationFrame(function () {
      overlay.classList.add('visible');
    });

    // Close handlers
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.closest('[data-modal-close]')) {
        close();
      }
    });

    Events.emit(EVENTS.UI_MODAL_OPEN, { title: opts.title });
    return overlay;
  }

  /**
   * Close the active modal
   */
  function close() {
    if (!_activeModal) return;
    var overlay = _activeModal.el;
    var onClose = _activeModal.onClose;

    overlay.classList.remove('visible');
    setTimeout(function () {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 200);

    _activeModal = null;

    if (typeof onClose === 'function') {
      try { onClose(); } catch (e) { console.error('[Modal] onClose error:', e); }
    }

    Events.emit(EVENTS.UI_MODAL_CLOSE);
  }

  /**
   * Update modal body content
   */
  function setBody(html) {
    if (!_activeModal) return;
    var body = _activeModal.el.querySelector('.modal-body');
    if (body) body.innerHTML = html;
  }

  /**
   * Update modal footer content
   */
  function setFooter(html) {
    if (!_activeModal) return;
    var footer = _activeModal.el.querySelector('.modal-footer');
    if (footer) {
      footer.innerHTML = html;
    } else {
      var modal = _activeModal.el.querySelector('.modal');
      footer = document.createElement('div');
      footer.className = 'modal-footer';
      footer.innerHTML = html;
      modal.appendChild(footer);
    }
  }

  /**
   * Check if a modal is currently open
   */
  function isOpen() {
    return _activeModal !== null;
  }

  /**
   * Confirm dialog (promise-free, callback-based)
   */
  function confirm(message, onConfirm, opts) {
    opts = opts || {};
    open({
      title: opts.title || '確認',
      size: 'sm',
      body: '<p style="font-size:var(--fs-md);color:var(--text-secondary);padding:var(--sp-2) 0;">' +
            Utils.escapeHtml(message) + '</p>',
      footer:
        '<button class="btn btn-secondary" data-modal-close>取消</button>' +
        '<button class="btn btn-danger" id="modal-confirm-btn">' +
        Utils.escapeHtml(opts.confirmText || '確認') + '</button>'
    });

    var btn = document.getElementById('modal-confirm-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        close();
        if (typeof onConfirm === 'function') onConfirm();
      });
    }
  }

  return {
    open: open,
    close: close,
    setBody: setBody,
    setFooter: setFooter,
    isOpen: isOpen,
    confirm: confirm
  };
})();

// Global aliases
function closeModal() { Modal.close(); }
