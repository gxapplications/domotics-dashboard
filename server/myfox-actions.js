'use strict'

const actions = function (api, reply, page, component, action = null, payload = {}) {
  switch (component.type) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 8:
      const doIt = require(`../lib/components/${component.type}/actions`)
      doIt(api, reply, page, component, action = null, payload = {})
      break

    default:
      // Action not (yet) supported
      reply({}).code(418)
  }
}

// exports
export default actions
