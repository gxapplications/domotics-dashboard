'use strict'

const actions = function (api, reply, page, component, action = null, payload = {}) {
  let macroId = `c_${component.id}`
  switch (component.type) {
    case 1:
      // 1: Scenario play
      let actions = JSON.parse(component.configuration).map((item) => {
        return {id: item.scenario, action: 'play', delay: item.delay * 60000}
      })
      const firstAction = actions.shift()

      api.callScenarioAction(firstAction, (err, data) => {
        if (err) {
          console.log(err)
          reply(err).code(500)
        }
        reply(data)
      }, macroId, ...actions)
      break

    // TODO !2: other actions
    default:
      // Action not (yet) supported
      reply({}).code(418)
  }
}

// exports
export default actions
