'use strict'

const actions = function (api, reply, page, component, action = null) {
  let macroId = `c_${component.id}`
  const configuration = JSON.parse(component.configuration)

  const [actionIdx, actionVerb] = action.split('-')

  // Map them to steps to play against API
  let steps = configuration.scenarii.map((scenario, idx) => {
    // eslint-disable-next-line eqeqeq
    if (idx == actionIdx) {
      return {
        id: scenario.id,
        action: (configuration.allow_none && actionVerb === 'off') ? 'off' : 'on'
      }
    }
    return {id: scenario.id, action: 'off'}
  })

  // Sort OFFs first, ON after.
  steps = steps.sort((a, b) => {
    return ((a === 'off') ? 1 : 2) - ((b === 'off') ? 1 : 2)
  })

  const firstAction = steps.shift()
  api.callScenarioAction(firstAction, (err, data) => {
    if (err) {
      console.log(err)
      return reply(err).code(500)
    }
    reply(data)
  }, macroId, ...steps)
}

// exports
export default actions
