/**
 * employees.js — Employee Management Page (Ctrl+6)
 * Booking System v2.0.0 (v8 spec)
 * Employees != Agents. Employees operate the Telegram Bot.
 * Two-level permissions: Admin (management) / Staff (regular)
 * Renders: KPI + employee cards + add form
 */
var EmployeesPage = (function () {

  function render() {
    var container = document.getElementById('page-employees');
    if (!container) return;

    var allEmployees = Employees.getAll();
    var activeEmployees = allEmployees.filter(function (e) { return e.active !== false; });
    var admins = allEmployees.filter(function (e) { return e.role === EMPLOYEE_ROLES.ADMIN; });

    var html = '';

    /* Page header */
    html += '<div class="page-header">';
    html += '  <h3>員工管理</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-primary" onclick="EmployeesPage.showAddForm()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    html += '      新增員工';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    /* KPI Cards */
    html += '<div class="kpi-grid">';
    html += _kpiCard('kpi-blue', '員工總數', allEmployees.length, '人', '所有授權員工',
      '<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>');
    html += _kpiCard('kpi-green', '在職員工', activeEmployees.length, '人', '目前可使用Bot',
      '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>');
    html += _kpiCard('kpi-gold', '管理員', admins.length, '人', '最高權限',
      '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>');
    html += _kpiCard('kpi-slate', '停用員工', allEmployees.length - activeEmployees.length, '人', '保留歷史記錄',
      '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.41 0 8 3.59 8 8 0 1.85-.63 3.55-1.69 4.9z"/></svg>');
    html += '</div>';

    /* Bot commands reference */
    html += '<div class="card" style="margin-bottom:var(--sp-4);">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/></svg></div>Bot 指令一覽</div>';
    html += '  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sp-2);">';
    for (var ci = 0; ci < BOT_COMMANDS.length; ci++) {
      var cmd = BOT_COMMANDS[ci];
      html += '<div style="padding:var(--sp-2) var(--sp-3);background:var(--bg-base);border-radius:var(--radius-md);">';
      html += '<div style="font-weight:600;font-size:var(--fs-sm);color:var(--color-primary);">' + Utils.escapeHtml(cmd.label) + '</div>';
      html += '<div style="font-size:var(--fs-xs);color:var(--text-muted);">' + Utils.escapeHtml(cmd.desc) + '</div>';
      if (cmd.adminOnly) {
        html += '<span style="font-size:var(--fs-xs);color:var(--color-warning);">[管理員]</span>';
      }
      html += '</div>';
    }
    html += '  </div>';
    html += '</div>';

    /* Employee cards */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>員工列表</div>';

    if (allEmployees.length === 0) {
      html += _emptyState();
    } else {
      /* Sort: active first, then admins first, then by name */
      var sorted = allEmployees.slice().sort(function (a, b) {
        if ((a.active !== false) !== (b.active !== false)) return a.active !== false ? -1 : 1;
        if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
        return (a.name || '').localeCompare(b.name || '');
      });

      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--sp-3);">';
      for (var i = 0; i < sorted.length; i++) {
        html += _employeeCard(sorted[i]);
      }
      html += '</div>';
    }
    html += '</div>';

    container.innerHTML = html;
  }

  function _employeeCard(emp) {
    var isActive = emp.active !== false;
    var isAdmin = emp.role === EMPLOYEE_ROLES.ADMIN;
    var initial = (emp.name || '?').charAt(0).toUpperCase();

    var html = '<div class="employee-card' + (!isActive ? ' inactive' : '') + '">';
    html += '  <div class="emp-avatar"' + (isAdmin ? ' style="background:var(--grad-primary);"' : '') + '>' + Utils.escapeHtml(initial) + '</div>';
    html += '  <div class="emp-info">';
    html += '    <div class="emp-name">' + Utils.escapeHtml(emp.name || '未知') + '</div>';
    html += '    <div class="emp-meta">';
    html += '      <span class="badge badge-' + (isAdmin ? 'blue' : 'slate') + '">' + Utils.escapeHtml(EMPLOYEE_ROLE_LABELS[emp.role] || emp.role) + '</span>';
    html += '      <span style="color:var(--text-muted);font-size:var(--fs-xs);">TG: ' + Utils.escapeHtml(emp.tgId) + '</span>';
    html += '    </div>';
    if (emp.authorizedAt) {
      var authDate = new Date(emp.authorizedAt).toLocaleDateString('zh-TW');
      html += '<div style="font-size:var(--fs-xs);color:var(--text-muted);">授權: ' + authDate + '</div>';
    }
    html += '  </div>';
    html += '  <div class="emp-actions">';

    /* Toggle active */
    if (isActive) {
      html += '<button class="btn btn-ghost btn-sm" onclick="EmployeesPage.toggleActive(\'' + emp.id + '\',false)" data-tooltip="停用">停用</button>';
    } else {
      html += '<button class="btn btn-ghost btn-sm" onclick="EmployeesPage.toggleActive(\'' + emp.id + '\',true)" data-tooltip="啟用">啟用</button>';
    }

    /* Toggle role */
    if (isActive) {
      if (isAdmin) {
        html += '<button class="btn btn-ghost btn-sm" onclick="EmployeesPage.setRole(\'' + emp.id + '\',\'staff\')" data-tooltip="降為員工">降為員工</button>';
      } else {
        html += '<button class="btn btn-ghost btn-sm" onclick="EmployeesPage.setRole(\'' + emp.id + '\',\'admin\')" data-tooltip="升為管理員">升管理員</button>';
      }
    }

    /* Remove (complete delete) */
    html += '<button class="btn btn-danger btn-sm" onclick="EmployeesPage.remove(\'' + emp.id + '\')" data-tooltip="刪除">刪除</button>';

    html += '  </div>';
    html += '</div>';
    return html;
  }

  function showAddForm() {
    var body =
      '<div class="form-group">' +
      '  <label>Telegram ID</label>' +
      '  <input type="text" id="emp-tg-id" placeholder="員工的 Telegram ID" autocomplete="off">' +
      '</div>' +
      '<div class="form-group">' +
      '  <label>姓名</label>' +
      '  <input type="text" id="emp-name" placeholder="員工姓名" autocomplete="off">' +
      '</div>' +
      '<div class="form-group">' +
      '  <label>角色</label>' +
      '  <select id="emp-role">' +
      '    <option value="staff">員工</option>' +
      '    <option value="admin">管理員</option>' +
      '  </select>' +
      '</div>' +
      '<p style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:var(--sp-2);">' +
      '  員工授權後可使用 Telegram Bot 進行訂房操作。管理員可使用 /新增授權 指令。' +
      '</p>';

    Modal.open({
      title: '新增員工',
      body: body,
      footer:
        '<button class="btn btn-secondary" data-modal-close>取消</button>' +
        '<button class="btn btn-primary" onclick="EmployeesPage.confirmAdd()">確認新增</button>'
    });
  }

  function confirmAdd() {
    var tgId = document.getElementById('emp-tg-id').value.trim();
    var name = document.getElementById('emp-name').value.trim();
    var role = document.getElementById('emp-role').value;

    if (!tgId) {
      Toast.error('請輸入 Telegram ID');
      return;
    }
    if (!name) {
      Toast.error('請輸入姓名');
      return;
    }

    var existing = Employees.getByTgId(tgId);
    if (existing) {
      Toast.warning('此 Telegram ID 已存在: ' + existing.name);
      return;
    }

    var emp = Employees.add(tgId, name, role);
    if (emp) {
      Toast.success('已新增員工: ' + name);
      Modal.close();
      render();
    } else {
      Toast.error('新增失敗');
    }
  }

  function toggleActive(id, active) {
    if (active) {
      Employees.activate(id);
      Toast.success('已啟用員工');
    } else {
      Modal.confirm('確認停用此員工？停用後將無法使用Bot。', function () {
        Employees.deactivate(id);
        Toast.success('已停用員工');
        render();
      }, { confirmText: '確認停用' });
    }
    if (active) render();
  }

  function setRole(id, role) {
    Employees.setRole(id, role);
    Toast.success('已更改角色為: ' + EMPLOYEE_ROLE_LABELS[role]);
    render();
  }

  function remove(id) {
    Modal.confirm('確認完全刪除此員工？此操作不可復原，歷史記錄將保留但員工帳號將被移除。', function () {
      Employees.remove(id);
      Toast.success('已刪除員工');
      render();
    }, { confirmText: '確認刪除', title: '危險操作' });
  }

  function _kpiCard(colorClass, label, value, unit, sub, iconSvg) {
    var html = '<div class="kpi-card ' + colorClass + '">';
    html += '  <div class="kpi-header"><span class="kpi-label">' + Utils.escapeHtml(label) + '</span><div class="kpi-icon">' + iconSvg + '</div></div>';
    html += '  <div class="kpi-value tabular-nums">' + value + '</div>';
    if (unit || sub) {
      html += '  <span class="kpi-sub">';
      if (unit) html += Utils.escapeHtml(unit);
      if (unit && sub) html += ' — ';
      if (sub) html += Utils.escapeHtml(sub);
      html += '</span>';
    }
    html += '</div>';
    return html;
  }

  function _emptyState() {
    return '<div class="empty-state">' +
      '<div class="empty-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>' +
      '<div class="empty-title">暫無員工</div>' +
      '<div class="empty-desc">點擊「新增員工」授權 Telegram Bot 使用者</div>' +
      '</div>';
  }

  return {
    render: render,
    showAddForm: showAddForm,
    confirmAdd: confirmAdd,
    toggleActive: toggleActive,
    setRole: setRole,
    remove: remove
  };
})();

function renderEmployees() { EmployeesPage.render(); }
