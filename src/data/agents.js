/**
 * agents.js — Agent List Management
 * v8: Added active flag for deactivation (without deletion)
 *     Agent != Employee (agent is the customer's representative)
 * Flow: add/rename/remove/setActive -> State.update -> Store.save -> syncToFirebase -> Events.emit
 */

var Agents = {

  /**
   * Add a new agent
   */
  add: function (name, phone) {
    if (!name) return null;

    /* Check duplicate */
    var existing = Agents.findByName(name);
    if (existing) {
      console.warn('[Agents] Duplicate name:', name);
      return existing;
    }

    var agent = {
      id:         Utils.generateAgentId(),
      _fbKey:     Utils.generateFbKey(),
      _createdAt: Date.now(),
      _updatedAt: Date.now(),
      name:       name,
      phone:      phone || '',
      active:     true
    };

    State.update('agentList', function (list) {
      list.push(agent);
      return list;
    });
    Store.saveAgentList(State.get('agentList'));
    syncAgentListToFirebase(State.get('agentList'));
    Events.emit(EVENTS.AGENT_ADDED, agent);
    console.log('[Agents] Added:', name);
    return agent;
  },

  /**
   * Rename an agent
   * Also updates bookings that reference this agent
   */
  rename: function (oldName, newName) {
    if (!oldName || !newName) return false;

    var renamed = false;
    State.update('agentList', function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].name === oldName) {
          list[i].name = newName;
          list[i]._updatedAt = Date.now();
          renamed = true;
          break;
        }
      }
      return list;
    });

    if (renamed) {
      Store.saveAgentList(State.get('agentList'));
      syncAgentListToFirebase(State.get('agentList'));

      /* Update bookings that reference this agent */
      var bookings = Bookings.getByAgent(oldName);
      for (var j = 0; j < bookings.length; j++) {
        Bookings.update(bookings[j]._fbKey, { agent: newName });
      }

      Events.emit(EVENTS.AGENT_RENAMED, { oldName: oldName, newName: newName });
      console.log('[Agents] Renamed:', oldName, '->', newName);
    }
    return renamed;
  },

  /**
   * Remove an agent completely
   */
  remove: function (name) {
    var deleted = false;
    State.update('agentList', function (list) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i].name === name) {
          list.splice(i, 1);
          deleted = true;
          break;
        }
      }
      return list;
    });

    if (deleted) {
      Store.saveAgentList(State.get('agentList'));
      syncAgentListToFirebase(State.get('agentList'));
      Events.emit(EVENTS.AGENT_REMOVED, name);
      console.log('[Agents] Removed:', name);
    }
    return deleted;
  },

  /**
   * Deactivate an agent (keep history, hide from active list)
   */
  deactivate: function (name) {
    return Agents.setActive(name, false);
  },

  /**
   * Activate a deactivated agent
   */
  activate: function (name) {
    return Agents.setActive(name, true);
  },

  /**
   * Set active flag on an agent
   */
  setActive: function (name, active) {
    var changed = false;
    State.update('agentList', function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].name === name) {
          list[i].active = active;
          list[i]._updatedAt = Date.now();
          changed = true;
          break;
        }
      }
      return list;
    });

    if (changed) {
      Store.saveAgentList(State.get('agentList'));
      syncAgentListToFirebase(State.get('agentList'));
      Events.emit(EVENTS.AGENT_LIST_UPDATED, State.get('agentList'));
      console.log('[Agents] setActive:', name, active);
    }
    return changed;
  },

  /**
   * Find agent by name
   */
  findByName: function (name) {
    var list = State.get('agentList');
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name) return list[i];
    }
    return null;
  },

  /**
   * Get active agent names only
   */
  getNames: function () {
    return State.getActiveAgents().map(function (a) { return a.name; });
  },

  /**
   * Get all agent names (including inactive)
   */
  getAllNames: function () {
    var list = State.get('agentList');
    return list.map(function (a) { return a.name; });
  },

  /**
   * Get all agents
   */
  getAll: function () {
    return State.get('agentList');
  },

  /**
   * Deduplicate agents by name (keep the newest _updatedAt)
   * Returns the deduplicated list (does NOT mutate state)
   */
  deduplicate: function () {
    var list = State.get('agentList') || [];
    var nameMap = {};
    for (var i = 0; i < list.length; i++) {
      var agent = list[i];
      var nameKey = (agent.name || '').toLowerCase().trim();
      if (!nameKey) continue;
      var existing = nameMap[nameKey];
      if (!existing) {
        nameMap[nameKey] = agent;
      } else {
        var existingTs = existing._updatedAt || 0;
        var agentTs = agent._updatedAt || 0;
        if (agentTs > existingTs) {
          nameMap[nameKey] = agent;
        }
      }
    }
    var result = [];
    for (var key in nameMap) {
      if (nameMap.hasOwnProperty(key)) {
        result.push(nameMap[key]);
      }
    }
    console.log('[Agents] Deduplicated:', list.length, '->', result.length);
    return result;
  }
};
