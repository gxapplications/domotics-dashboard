'use strict'

import config from 'config'

class Context {
  constructor () {
    this._created = (new Date()).getTime()
    this.api = null
    this.server = null
    this.states = {macro: {}}
    this.refreshers = {}
  }

  updateState (label, value, _, timestamp) {
    const refresher = config.get('server.myfox.data-refresher.' + label)
    if (refresher) {
      this.updateRefresher(refresher)
    }
    console.log('Context updated with element ' + label)
    this.states[label] = {value, updated: timestamp}

    if (this.server) {
      this.server.publish('/socket/' + label, this.states[label])
    }
  }

  updateManyStates (data) {
    const now = new Date().getTime()
    for (let prop in data) {
      this.updateState(prop, data[prop], undefined, now)
    }
  }

  updateMacro (id, data, state, remaining, timestamp) {
    console.log('Context updated with macro element ' + id)
    this.states.macro[id] = {data, state, remaining, timestamp}

    if (this.server) {
      this.server.publish('/socket/macro', this.states.macro)
    }
    return true
  }

  updateRefresher (refresher) {
    const validity = config.has('server.myfox.refresher-validity.' + refresher) ? config.get('server.myfox.refresher-validity.' + refresher) : 0 // In seconds
    if (validity === 0) {
      return
    }
    let when = (new Date()).getTime() + (validity * 1000)

    if (this.refreshers[refresher] && this.refreshers[refresher].when === when) {
      return
    }
    if (this.refreshers[refresher] && this.refreshers[refresher].when < when) {
      clearTimeout(this.refreshers[refresher].trigger)
    }
    this.refreshers[refresher] = {
      when,
      trigger: setTimeout(() => {
        console.log('Auto-refresh needed for Context on ' + refresher)
        this.api[refresher]((err) => {
          if (err) {
            // FIXME !9: manage error case: send message through socket ? schedule refresh sooner ?
          }
          this.updateRefresher(refresher)
        })
      }, validity * 1000)
    }
  }

  subscribeToApiEvents (api) {
    this.api = api
    this.api.addStateListener('status', this.updateState.bind(this))
    this.api.addStateListener('alarm', this.updateState.bind(this))
    this.api.addStateListener('scenarii', this.updateState.bind(this))
    this.api.addStateListener('domotic', this.updateState.bind(this))
    this.api.addStateListener('data', this.updateState.bind(this))
    this.api.addStateListener('heat', this.updateState.bind(this))
    this.api.addMacroListener(this.updateMacro.bind(this))
  }
}

// Register Context as middleware in Hapi server
const statefulContext = new Context()
exports.register = function (server, options, next) {
  statefulContext.server = server
  server.ext('onRequest', function (request, reply) {
    request.context = statefulContext
    return reply.continue()
  })
  return next()
}
exports.register.attributes = {
  name: 'domotics-dashboard-context'
}
