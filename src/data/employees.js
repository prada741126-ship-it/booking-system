/**
 * employees.js — Employee Management (v8 new)
 * Manages Telegram Bot authorized users with two-level permissions
 *   Admin  (管理員): you + accountant + shareholders
 *   Staff  (員工): regular staff who operate the Bot
 * Employees != Agents (employees operate the Bot, agents are customer representatives)
 * Flow: add/update/remove -> State.update -> Store.save -> syncToFirebase -> Events.emit
 */

var Employees = {

  /**
   * Add a new employee
   * Called by Auth.authorizeEmployee or Web management
   */
  add: function (tgId, name, role) {
    if (!tgId) return null;
    role = role || EMPLOYEE_ROLES.STAFF;

    /* Check if already exists by tgId */
    var existing = Employees.getByTgId(tgId);
    if (existing) {
      console.warn('[Employees] Already exists:', tgId);
      /* Reactivate if deactivated */
      if (existing.active === false) {
        return Employees.update(existing.id, {
          active: true,
          name: name || existing.name,
          role: role
        });
      }
      return existing;
    }

    var employee = {
      id:           Utils.generateEmployeeId(),
      _fbKey:       Utils.generateFbKey(),
      _createdAt:   Date.now(),
      _updatedAt:   Date.now(),
      tgId:         String(tgId),
      name:         name || '',
      role:         role,
      active:       true,
      authorizedAt: new Date().toISOString()
    };

    State.update('employeeList', function (list) {
      list.push(employee);
      return list;
    });
    Store.saveEmployeeList(State.get('employeeList'));
    syncEmployeeListToFirebase(State.get('employeeList'));
    Events.emit(EVENTS.EMPLOYEE_ADDED, employee);
    console.log('[Employees] Added:', employee.name, '(' + role + ')');
    return employee;
  },

  /**
   * Update employee fields
   */
  update: function (id, data) {
    var updated = null;

    State.update('employeeList', function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          for (var key in data) {
            if (data.hasOwnProperty(key) && key.charAt(0) !== '_') {
              list[i][key] = data[key];
            }
          }
          list[i]._updatedAt = Date.now();
          updated = list[i];
          break;
        }
      }
      return list;
    });

    if (updated) {
      Store.saveEmployeeList(State.get('employeeList'));
      syncEmployeeListToFirebase(State.get('employeeList'));
      Events.emit(EVENTS.EMPLOYEE_UPDATED, updated);
    }
    return updated;
  },

  /**
   * Remove an employee completely
   */
  remove: function (id) {
    var deleted = false;
    State.update('employeeList', function (list) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i].id === id) {
          list.splice(i, 1);
          deleted = true;
          break;
        }
      }
      list._updatedAt = Date.now();
      return list;
    });

    if (deleted) {
      Store.saveEmployeeList(State.get('employeeList'));
      syncEmployeeListToFirebase(State.get('employeeList'));
      Events.emit(EVENTS.EMPLOYEE_REMOVED, id);
      console.log('[Employees] Removed:', id);
    }
    return deleted;
  },

  /**
   * Deactivate an employee (revoke Bot access, keep history)
   */
  deactivate: function (id) {
    return Employees.update(id, { active: false });
  },

  /**
   * Activate a deactivated employee
   */
  activate: function (id) {
    return Employees.update(id, { active: true });
  },

  /**
   * Change employee role
   */
  setRole: function (id, role) {
    return Employees.update(id, { role: role });
  },

  /* ===== Query Methods ===== */

  getById: function (id) {
    var list = State.get('employeeList');
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  },

  getByTgId: function (tgId) {
    var list = State.get('employeeList');
    var tid = String(tgId);
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].tgId) === tid) return list[i];
    }
    return null;
  },

  getAdmins: function () {
    return State.get('employeeList').filter(function (e) {
      return e.role === EMPLOYEE_ROLES.ADMIN && e.active !== false;
    });
  },

  getActive: function () {
    return State.getActiveEmployees();
  },

  getAll: function () {
    return State.get('employeeList');
  },

  isAdmin: function (id) {
    var emp = Employees.getById(id);
    return emp && emp.role === EMPLOYEE_ROLES.ADMIN;
  },

  isAdminByTgId: function (tgId) {
    var emp = Employees.getByTgId(tgId);
    return emp && emp.role === EMPLOYEE_ROLES.ADMIN && emp.active !== false;
  }
};
