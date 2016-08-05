'use strict'

const actions = function (api, reply, page, component, action = null, payload = {}) {
  let macroId = `c_${component.id}`
  switch (component.type) {
    case 1:
      // 1: Scenario play
      let actions = component.configuration.map((item) => {
        return {id: item.scenario, action: 'play', delay: item.delay}
      })
      const firstAction = actions.shift()

      // TODO !0: - il faut pouvoir forcer une macro ID ! sinon on la retrouvera pas... (adapter library myfox-wrapper-api)
      api.callScenarioAction(firstAction, () => {
        // TODO !0: err, reply(???)
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
