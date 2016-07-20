'use strict'

import config from 'config'

class Context {
  constructor() {
    this._created = (new Date()).getTime()
    this.api = null
    this.states = {}
    this.refreshers = {}
  }

  updateState(label, value, _, timestamp) {
    const refresher = config.get('server.myfox.data-refresher.' + label)
    if (refresher) {
        this.updateRefresher(refresher)
    }
    console.log('Context updated with element ' + label)
    this.states[label] = {value, updated: timestamp}

    // TODO !1: Si une socket est la, envoyer dedans !
  }

  updateManyStates(data) {
    const now = new Date().getTime()
    for (let prop in data) {
      this.updateState(prop, data[prop], undefined, now)
    }
  }

  updateMacro() {
    // TODO !2
    /*
     * The listener is a function, that will be called with the following arguments:
     * - macro ID,
     * - data: an object with the parser response, depending on the call made,
     * - state: a label with the following allowed values: progress, finished,
     * - remaining: The number of steps in the macro still in the queue. When remaining==0, then the state should be 'finished'.
     * - timestamp: a timestamp (creation date of the event)
     * Important: the listener must return a boolean:
     * - true to be kept for the next event,
     * - false if the listener must be unregistered after this event.
     */
  }

  updateRefresher(refresher) {
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
            // FIXME !3: manage error case: send message through socket ? schedule refresh sooner ?
          }
          this.updateRefresher(refresher)
        })
      }, validity * 1000)
    }
  }

  subscribeToApiEvents(api) {
    this.api = api
    this.api.addStateListener('status', this.updateState.bind(this))
    this.api.addStateListener('alarm', this.updateState.bind(this))
    this.api.addStateListener('scenarii', this.updateState.bind(this))
    this.api.addStateListener('data', this.updateState.bind(this))
    this.api.addStateListener('heat', this.updateState.bind(this))
    this.api.addMacroListener(this.updateMacro.bind(this))
  }
}

// Register Context as middleware in Hapi server
const statefulContext = new Context()
exports.register = function (server, options, next) {
  server.ext('onRequest', function (request, reply) {
    request.context = statefulContext
    return reply.continue()
  })
  return next()
}
exports.register.attributes = {
  name: 'domotics-dashboard-context'
}
