/**
 * agents.js — Agent List Management
 * Pattern: faithfully reused from v13.0.5
 */
var Agents = {

  /**
   * Add a new agent
   */
  add: function (name, phone) {
    if (!name) return null;
    // Check duplicate
    var existing = Agents.findByName(name);
    if (existing) {
      console.warn('[Agents] Duplicate name:', name);
      return existing;
    }

    var agent = {
      _fbKey:     Utils.generateFbKey(),
      _createdAt: Date.now(),
      _updatedAt: Date.now(),
      name:       name,
      phone:      phone || ''
    };

    State.update('agentList', function (list) {
      list.push(agent);
      return list;
    });
    Store.saveAgentList(State.get('agentList'));
    syncAgentListToFirebase(State.get('agentList'));
    Events.emit(EVENTS.AGENT_ADDED, agent);
    return agent;
  },

  /**
   * Rename an agent
   */
  rename: function (oldName, newName) {
    if (!oldName || !newName) return false;

    State.update('agentList', function (list) {
      for (var i = 0; i < list.length; i++) {
        if ((list[i].name || list[i]) === oldName) {
          if (typeof list[i] === 'object') {
            list[i].name = newName;
            list[i]._updatedAt = Date.now();
          } else {
            list[i] = newName;
          }
          break;
        }
      }
      return list;
    });

    Store.saveAgentList(State.get('agentList'));
    syncAgentListToFirebase(State.get('agentList'));

    // Also update bookings that reference this agent
    var bookings = Bookings.getByAgent(oldName);
    for (var j = 0; j < bookings.length; j++) {
      Bookings.update(bookings[j]._fbKey, { agent: newName });
    }

    Events.emit(EVENTS.AGENT_RENAMED, { oldName: oldName, newName: newName });
    return true;
  },

  /**
   * Remove an agent
   */
  remove: function (name) {
    var deleted = false;
    State.update('agentList', function (list) {
      for (var i = list.length - 1; i >= 0; i--) {
        if ((list[i].name || list[i]) === name) {
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
    }
    return deleted;
  },

  /**
   * Find agent by name
   */
  findByName: function (name) {
    var list = State.get('agentList');
    for (var i = 0; i < list.length; i++) {
      if ((list[i].name || list[i]) === name) return list[i];
    }
    return null;
  },

  /**
   * Get all agent names
   */
  getNames: function () {
    var list = State.get('agentList');
    return list.map(function (a) { return a.name || a; });
  },

  /**
   * Get all agents
   */
  getAll: function () {
    return State.get('agentList');
  }
};
