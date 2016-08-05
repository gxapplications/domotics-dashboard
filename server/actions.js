'use strict'

const actions = function (api, reply, page, component, action = null, payload = {}) {
  let macroId = `c_${component.id}`
  switch (component.type) {
    case 1:
      // 1: Scenario play
      let actions = JSON.parse(component.configuration).map((item) => {
        return {id: item.scenario, action: 'play', delay: item.delay}
      })
      const firstAction = actions.shift()

      console.log(actions, firstAction, ...actions)

      api.callScenarioAction(firstAction, (err, data) => {
        if (err) {
          console.log(err)
        }
        // TODO !0: err, reply(???), gérer le retour ! peut etre direct, pour par suivi de macroId, selon config.
      }, macroId, ...actions)
      break

    // TODO !9: other actions
    default:
      // Action not (yet) supported
      reply({}).code(418)
  }
}

// exports
export default actions
