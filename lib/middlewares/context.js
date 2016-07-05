'use strict'

class Context {
  constructor() {
    this._created = new Date().getTime()
    this.api = null
  }

  subscribeToApiEvents(api) {
    this.api = api
    this.api.addStateListener('status', this.update.bind(this))
    this.api.addStateListener('alarm', this.update.bind(this))
    this.api.addStateListener('scenarii', this.update.bind(this))
    this.api.addStateListener('data', this.update.bind(this))
    this.api.addStateListener('heat', this.update.bind(this))
  }

  update(label, value, _, timestamp) {
    // TODO !2: passer dans un switch case, selon leur label. Leur donner une duree de validitee. Memo le tout. Si une socket est la, envoyer dedans !
  }

  updateMany(data) {
    const now = new Date().getTime()
    for (let prop in data) {
        this.update(prop, data[prop], undefined, now)
    }
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
