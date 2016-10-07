'use strict'

import db from './db'
import CryptoJS from 'crypto-js'

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

      api.callDomoticAction(firstAction, (err, data) => {
        if (err) {
          console.log(err)
          reply(err).code(500)
        }
        reply(data)
      }, macroId, ...actions)
      break

    case 4:
      // 4: Heat mode
      firstAction = {
        id: configuration.heat,
        action: action,
        delay: configuration.delay * 60000
      }
      if (configuration.reset_delay > 0 && configuration.reset_action) {
        actions.push({
          id: configuration.heat,
          action: configuration.reset_action,
          delay: configuration.reset_delay * 60000
        })
      }
      api.callHeatingAction(firstAction, (err, data) => {
        if (err) {
          console.log(err)
          reply(err).code(500)
        }
        reply(data)
      }, macroId, ...actions)
      break

    case 5:
      // 5: Alarm level
      let password
      if (payload.pattern) {
        // Decrypt password from pattern, and use it to login.
        try {
          db.getPassword((err, row) => {
            if (err) {
              return reply(err.toString()).code(401)
            }

            try {
              let cryptedPassword = row.password
              if (!cryptedPassword) {
                return reply({}).code(401)
              }
              let passwordBytes = CryptoJS.AES.decrypt(cryptedPassword, 'azerty' + payload.pattern)
              password = passwordBytes.toString(CryptoJS.enc.Utf8)
              if (!password) {
                return reply({}).code(401)
              }
            } catch (err) {
              return reply(err.toString()).code(401)
            }

            firstAction = {
              action: action,
              password: password
            }
            api.callAlarmLevelAction(firstAction, (err, data) => {
              if (err) {
                console.log(err)
                reply(err).code(500)
              }
              reply(data)
            })
          })
        } catch (err) {
          return reply(err.toString()).code(401)
        }
      } else {
        firstAction = {
          action: action
        }
        api.callAlarmLevelAction(firstAction, (err, data) => {
          if (err) {
            console.log(err)
            reply(err).code(500)
          }
          reply(data)
        })
      }
      break

    case 8:
      // 8: Multiple scenarii switch
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

      firstAction = steps.shift()
      api.callScenarioAction(firstAction, (err, data) => {
        if (err) {
          console.log(err)
          reply(err).code(500)
        }
        reply(data)
      }, macroId, ...steps)
      break

    case 6:
      // 6: Heating dashboard - Scenarii piloted
      const [actionKey, actionData] = action.split('-')

      if (actionKey === 'inspect_temperatures') {
        api.inspectScenarioTemperatureSettings(actionData, (err, data) => {
          if (err) {
            console.log(err)
            reply(err).code(500)
          }
          reply(data)
        })
      } else {
        // TODO autre actions a faire quand besoin
      }
      break

    default:
      // Action not (yet) supported
      reply({}).code(418)
  }
}

// exports
export default actions
