/**
 * backup.js — Backup & Restore
 * v8: Updated for new data model (employees, archives, closedMonths, settings)
 *     Removed exportJSON/importJSON (v8: no export, keep print only)
 *     Fixed: no longer uses non-existent Store.load/save third param or State.batchSet
 */

var Backup = {

  /**
   * Create a backup snapshot
   */
  create: function (label) {
    var now = new Date();
    var timestamp = now.getTime();
    var dateStr = Utils.formatDateFull(Utils.today()) + ' ' +
                  Utils.pad(now.getHours()) + ':' + Utils.pad(now.getMinutes());

    var snapshot = {
      id: timestamp,
      label: label || ('\u5099\u4efd ' + dateStr),
      timestamp: timestamp,
      version: APP.VERSION,
      data: {
        bookings:     State.get('bookings'),
        hotelConfig:  State.get('hotelConfig'),
        agentList:    State.get('agentList'),
        employeeList: State.get('employeeList'),
        archives:     State.get('archives'),
        closedMonths: State.get('closedMonths'),
        settings:     State.get('settings'),
        workingMonth: State.get('workingMonth')
      }
    };

    /* Save to localStorage */
    var backups = Store.load(STORAGE_KEYS.BACKUP_LIST) || [];
    backups.push({ id: timestamp, label: snapshot.label, timestamp: timestamp });
    Store.save(STORAGE_KEYS.BACKUP_LIST, backups);
    Store.save(STORAGE_KEYS.BACKUP_PREFIX + timestamp, snapshot);
    Store.save(STORAGE_KEYS.LAST_BACKUP_DATE, dateStr);

    console.log('[Backup] Created:', snapshot.label);
    return snapshot;
  },

  /**
   * Restore from a backup
   */
  restore: function (backupId) {
    var snapshot = Store.load(STORAGE_KEYS.BACKUP_PREFIX + backupId);
    if (!snapshot || !snapshot.data) {
      console.error('[Backup] Restore failed: snapshot not found');
      return false;
    }

    var d = snapshot.data;
    State.set('bookings',     d.bookings     || []);
    State.set('hotelConfig',  d.hotelConfig  || null);
    State.set('agentList',    d.agentList    || []);
    State.set('employeeList', d.employeeList || []);
    State.set('archives',     d.archives     || []);
    State.set('closedMonths', d.closedMonths || []);
    State.set('settings',     d.settings     || {});
    if (d.workingMonth) {
      State.set('workingMonth', d.workingMonth);
    }

    /* Save all to store */
    Store.saveBookings(State.get('bookings'));
    Store.saveHotelConfig(State.get('hotelConfig'));
    Store.saveAgentList(State.get('agentList'));
    Store.saveEmployeeList(State.get('employeeList'));
    Store.saveArchives(State.get('archives'));
    Store.saveClosedMonths(State.get('closedMonths'));
    Store.saveSettings(State.get('settings'));

    /* Sync to Firebase */
    if (typeof syncUploadAll === 'function') {
      syncUploadAll();
    }

    Events.emit(EVENTS.UI_RENDER, {});
    Events.emit(EVENTS.UI_TOAST, { type: 'success', message: '\u9084\u539f\u6210\u529f' });
    console.log('[Backup] Restored:', snapshot.label);
    return true;
  },

  /**
   * List all backups
   */
  list: function () {
    return Store.load(STORAGE_KEYS.BACKUP_LIST) || [];
  },

  /**
   * Delete a backup
   */
  remove: function (backupId) {
    var backups = Backup.list();
    var filtered = backups.filter(function (b) { return b.id !== backupId; });
    Store.save(STORAGE_KEYS.BACKUP_LIST, filtered);
    Store.remove(STORAGE_KEYS.BACKUP_PREFIX + backupId);
    return true;
  },

  /**
   * Get last backup date string
   */
  getLastBackupDate: function () {
    return Store.load(STORAGE_KEYS.LAST_BACKUP_DATE) || '--';
  }
};
