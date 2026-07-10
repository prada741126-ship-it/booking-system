/**
 * auth.js — Authentication (shared password, SHA-256)
 * v8: Web backend uses shared password (you + accountant + shareholders)
 * Bot uses Telegram ID + two-level permissions (admin/staff)
 */
var Auth = (function () {

  function getStoredHash() {
    var auth = Store.loadAuth();
    if (auth && auth.hash) return auth.hash;
    return DEFAULT_PASSWORD_HASH;
  }

  function hashPassword(password) {
    if (typeof CryptoJS !== 'undefined') {
      return CryptoJS.SHA256(password).toString();
    }
    console.error('[Auth] CryptoJS not loaded');
    return null;
  }

  function login(password) {
    if (!password) return false;
    var inputHash = hashPassword(password);
    if (!inputHash) return false;
    var storedHash = getStoredHash();
    if (inputHash === storedHash) {
      var auth = Store.loadAuth() || {};
      auth.loginTime = Date.now();
      auth.isLoggedIn = true;
      Store.saveAuth(auth);
      State.set('isLoggedIn', true);
      return true;
    }
    return false;
  }

  function logout() {
    var auth = Store.loadAuth() || {};
    auth.isLoggedIn = false;
    Store.saveAuth(auth);
    State.set('isLoggedIn', false);
  }

  function isLoggedIn() {
    var auth = Store.loadAuth();
    if (!auth || !auth.isLoggedIn) return false;
    /* Check session timeout */
    if (auth.loginTime) {
      var elapsed = Date.now() - auth.loginTime;
      if (elapsed > CONFIG.SESSION_TIMEOUT) {
        logout();
        return false;
      }
    }
    return true;
  }

  function changePassword(oldPassword, newPassword) {
    var oldHash = hashPassword(oldPassword);
    var storedHash = getStoredHash();
    if (oldHash !== storedHash) {
      return { success: false, message: '舊密碼不正確' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: '新密碼至少4個字符' };
    }
    var newHash = hashPassword(newPassword);
    var auth = Store.loadAuth() || {};
    auth.hash = newHash;
    auth.loginTime = Date.now();
    auth.isLoggedIn = true;
    Store.saveAuth(auth);
    return { success: true, message: '密碼已修改' };
  }

  /* ===== Bot auth (Telegram ID based) ===== */
  function authorizeEmployee(tgId, name, role) {
    role = role || EMPLOYEE_ROLES.STAFF;
    var employees = Store.loadEmployeeList();
    /* Check if already exists */
    var existing = employees.find(function (e) { return e.tgId === tgId; });
    if (existing) {
      existing.active = true;
      existing.name = name || existing.name;
      existing.role = role;
      Store.saveEmployeeList(employees);
      return { success: true, employee: existing, isNew: false };
    }
    var emp = {
      id: Utils.generateEmployeeId(),
      tgId: tgId,
      name: name,
      role: role,
      active: true,
      authorizedAt: new Date().toISOString(),
      authorizedBy: 'admin'
    };
    employees.push(emp);
    Store.saveEmployeeList(employees);
    return { success: true, employee: emp, isNew: true };
  }

  function revokeEmployee(tgId) {
    var employees = Store.loadEmployeeList();
    var emp = employees.find(function (e) { return e.tgId === tgId; });
    if (emp) {
      emp.active = false;
      Store.saveEmployeeList(employees);
      return true;
    }
    return false;
  }

  function getEmployeeByTgId(tgId) {
    var employees = Store.loadEmployeeList();
    return employees.find(function (e) { return e.tgId === tgId && e.active !== false; });
  }

  function isAdmin(tgId) {
    var emp = getEmployeeByTgId(tgId);
    return emp && emp.role === EMPLOYEE_ROLES.ADMIN;
  }

  return {
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    changePassword: changePassword,
    /* Bot */
    authorizeEmployee: authorizeEmployee,
    revokeEmployee: revokeEmployee,
    getEmployeeByTgId: getEmployeeByTgId,
    isAdmin: isAdmin
  };
})();
