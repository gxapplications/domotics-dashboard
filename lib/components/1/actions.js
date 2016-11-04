'use strict'

const actions = function (api, reply, page, component) {
  let macroId = `c_${component.id}`
  const configuration = JSON.parse(component.configuration)

  const actions = configuration.map((item) => {
    return {id: item.scenario, action: 'play', delay: item.delay * 60000}
  })
  const firstAction = actions.shift()

  api.callScenarioAction(firstAction, (err, data) => {
    if (err) {
      console.log(err)
      return reply(err).code(500)
    }
    reply(data)
  }, macroId, ...actions)
}

// exports
export default actions
