'use strict'

const actions = function (api, reply, page, component, action = null) {
  let macroId = `c_${component.id}`
  const configuration = JSON.parse(component.configuration)
  const actions = []

  const firstAction = {
    id: configuration.domotic,
    action: action,
    delay: configuration.delay * 60000
  }
  if (configuration.reset_delay > 0 && configuration.reset_action) {
    actions.push({
      id: configuration.domotic,
      action: configuration.reset_action,
      delay: configuration.reset_delay * 60000
    })
  }

  api.callDomoticAction(firstAction, (err, data) => {
    if (err) {
      console.log(err)
      return reply(err).code(500)
    }
    reply(data)
  }, macroId, ...actions)
}

// exports
export default actions
