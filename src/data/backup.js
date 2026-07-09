/**
 * backup.js — Backup & Restore
 * Pattern: faithfully reused from v13.0.5 data/backup.js
 */
var Backup = {

  /**
   * Create a backup snapshot
   */
  create: function (label) {
    var now = new Date();
    var timestamp = now.getTime();
    var dateStr = Utils.formatDate(now) + ' ' + Utils.pad(now.getHours()) + ':' + Utils.pad(now.getMinutes());

    var snapshot = {
      id: timestamp,
      label: label || ('備份 ' + dateStr),
      timestamp: timestamp,
      version: APP.VERSION,
      data: {
        bookings: State.get('bookings'),
        hotelConfig: State.get('hotelConfig'),
        agentList: State.get('agentList'),
        botLogs: State.get('botLogs'),
        workingMonth: State.get('workingMonth')
      }
    };

    // Save to localStorage
    var backups = Store.load(STORAGE_KEYS.BACKUP_LIST, true) || [];
    backups.push({ id: timestamp, label: snapshot.label, timestamp: timestamp });
    Store.save(STORAGE_KEYS.BACKUP_LIST, backups, true);
    Store.save(STORAGE_KEYS.BACKUP_PREFIX + timestamp, snapshot, true);
    Store.save(STORAGE_KEYS.LAST_BACKUP_DATE, dateStr, false);

    return snapshot;
  },

  /**
   * Restore from a backup
   */
  restore: function (backupId) {
    var snapshot = Store.load(STORAGE_KEYS.BACKUP_PREFIX + backupId, true);
    if (!snapshot || !snapshot.data) {
      console.error('[Backup] Restore failed: snapshot not found');
      return false;
    }

    var d = snapshot.data;
    State.batchSet([
      { key: 'bookings',    value: d.bookings    || [] },
      { key: 'hotelConfig', value: d.hotelConfig || [] },
      { key: 'agentList',   value: d.agentList   || [] },
      { key: 'botLogs',     value: d.botLogs     || [] },
      { key: 'workingMonth',value: d.workingMonth|| null }
    ]);

    Store.saveAll();
    Events.emit(EVENTS.UI_RENDER);
    return true;
  },

  /**
   * List all backups
   */
  list: function () {
    return Store.load(STORAGE_KEYS.BACKUP_LIST, true) || [];
  },

  /**
   * Delete a backup
   */
  remove: function (backupId) {
    var backups = Backup.list();
    var filtered = backups.filter(function (b) { return b.id !== backupId; });
    Store.save(STORAGE_KEYS.BACKUP_LIST, filtered, true);
    Store.remove(STORAGE_KEYS.BACKUP_PREFIX + backupId);
    return true;
  },

  /**
   * Export as JSON file
   */
  exportJSON: function () {
    var snapshot = Backup.create('Export ' + Utils.formatDate(new Date()));
    var json = JSON.stringify(snapshot, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'booking-backup-' + Utils.formatDate(new Date()) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Import from JSON file
   */
  importJSON: function (file, callback) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var snapshot = JSON.parse(e.target.result);
        if (!snapshot.data) {
          callback(false, 'Invalid backup format');
          return;
        }
        var d = snapshot.data;
        State.batchSet([
          { key: 'bookings',    value: d.bookings    || [] },
          { key: 'hotelConfig', value: d.hotelConfig || [] },
          { key: 'agentList',   value: d.agentList   || [] },
          { key: 'botLogs',     value: d.botLogs     || [] }
        ]);
        Store.saveAll();
        Events.emit(EVENTS.UI_RENDER);
        if (callback) callback(true);
      } catch (err) {
        console.error('[Backup] Import failed:', err);
        if (callback) callback(false, err.message);
      }
    };
    reader.readAsText(file);
  }
};
