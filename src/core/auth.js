/**
 * auth.js — Simple Authentication (SHA-256 hash)
 * Pattern: reused from v13.0.5
 * Password hash stored, not plaintext
 */
var Auth = (function () {
  var _sessionTimer = null;

  function _hashPassword(pwd) {
    if (typeof CryptoJS === 'undefined') {
      // Fallback: simple hash (not secure, but works without CryptoJS)
      var hash = 0;
      for (var i = 0; i < pwd.length; i++) {
        var char = pwd.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return String(hash);
    }
    return CryptoJS.SHA256(pwd).toString();
  }

  function init() {
    var stored = Store.loadAuth();
    if (!stored) {
      // First time: set default password
      var defaultHash = _hashPassword('admin123');
      Store.saveAuth({
        passwordHash: defaultHash,
        isFirstTime: true
      });
      return { isFirstTime: true };
    }
    return stored;
  }

  function login(pwd) {
    var auth = Store.loadAuth();
    if (!auth) {
      var result = init();
      if (result.isFirstTime) {
        auth = Store.loadAuth();
      }
    }
    var inputHash = _hashPassword(pwd);
    if (inputHash === auth.passwordHash) {
      _startSession();
      State.set('auth', { loggedIn: true, timestamp: Date.now() });
      return true;
    }
    return false;
  }

  function changePassword(oldPwd, newPwd) {
    var auth = Store.loadAuth();
    if (!auth) return false;
    var oldHash = _hashPassword(oldPwd);
    if (oldHash !== auth.passwordHash) return false;
    var newHash = _hashPassword(newPwd);
    Store.saveAuth({
      passwordHash: newHash,
      isFirstTime: false
    });
    return true;
  }

  function logout() {
    _stopSession();
    State.set('auth', null);
  }

  function isLoggedIn() {
    var auth = State.get('auth');
    return auth && auth.loggedIn === true;
  }

  function _startSession() {
    _stopSession();
    _sessionTimer = setTimeout(function () {
      logout();
      Events.emit(EVENTS.UI_TOAST, { type: 'warning', message: '登入已逾時，請重新登入' });
    }, CONFIG.SESSION_TIMEOUT);
  }

  function _stopSession() {
    if (_sessionTimer) {
      clearTimeout(_sessionTimer);
      _sessionTimer = null;
    }
  }

  function resetSession() {
    _startSession();
  }

  return {
    init: init,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    changePassword: changePassword,
    resetSession: resetSession
  };
})();
