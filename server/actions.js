'use strict'

const actions = function (api, reply, page, component, action = null, payload = {}) {
  let macroId = `c_${component.id}`
  const configuration = JSON.parse(component.configuration)
  let actions = []
  let firstAction = null
  switch (component.type) {
    case 1:
      // 1: Scenario play
      actions = configuration.map((item) => {
        return {id: item.scenario, action: 'play', delay: item.delay * 60000}
      })
      firstAction = actions.shift()

      api.callScenarioAction(firstAction, (err, data) => {
        if (err) {
          console.log(err)
          reply(err).code(500)
        }
        reply(data)
      }, macroId, ...actions)
      break

    case 2:
      // 2: Scenario activation
      firstAction = {
        id: configuration.scenario,
        action: action,
        delay: configuration.delay * 60000
      }
      if (configuration.reset_delay > 0 && configuration.reset_action) {
        actions.push({
          id: configuration.scenario,
          action: configuration.reset_action,
          delay: configuration.reset_delay * 60000
        })
      }

      api.callScenarioAction(firstAction, (err, data) => {
        if (err) {
          console.log(err)
          reply(err).code(500)
        }
        reply(data)
      }, macroId, ...actions)
      break

    case 3:
      // 3: Domotic switch
      firstAction = {
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
      // TODO !0: l'API devrait mettre a jour le persistentState après avoir eu le 'ok', avec un nouvel attribut optionnel 'supposedState' à 'on' ou 'off'. Coté API.
      api.callDomoticAction(firstAction, (err, data) => {
        if (err) {
          console.log(err)
          reply(err).code(500)
        }
        reply(data)
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
