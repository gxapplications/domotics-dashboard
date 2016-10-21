'use strict'

import _ from 'lodash'
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

      // TODO !6: after modularization, the following method should be static
      // loop over scenarii to fix and chain promises sequentially to fix each
      const chainUpdateScenarioTemperatureSettings = function (scenarioFixes, api) {
        return _.reduce(scenarioFixes, (prom, fixData, scenarioId) => {
          // fixData is [{toTemperature, controls: {only checked conditions, 0 to 3}}]
          return prom.then(() => {
            return new Promise((resolve, reject) => {
              api.updateScenarioTemperatureSettings(scenarioId, fixData, (err, res) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(res)
                }
              })
            })
          })
        }, Promise.resolve())
      }

      if (actionKey === 'inspect_temperatures') {
        api.inspectScenarioTemperatureSettings(actionData, (err, data) => {
          if (err) {
            console.log(err)
            reply(err).code(500)
          }
          reply(data)
        })
      } else if (actionKey === 'fix_temperatures') {
        // do not use the configuration from DB: not yet updated at this step. Use received payload instead.
        const volatileConfiguration = db.fixPayload(payload)

        // fix min/max settings
        if (volatileConfiguration.temp_max_max < volatileConfiguration.temp_min_min + 3) {
          volatileConfiguration.temp_max_max = volatileConfiguration.temp_min_min + 3
        }
        /* if (! volatileConfiguration.temp_max_value || !volatileConfiguration.temp_min_value) {
          volatileConfiguration.temp_max_value = volatileConfiguration.temp_max_max
          volatileConfiguration.temp_min_value = volatileConfiguration.temp_min_min
        } */
        if (volatileConfiguration.temp_max_value > volatileConfiguration.temp_max_max ||
            volatileConfiguration.temp_max_value < volatileConfiguration.temp_min_min + 1 ||
            volatileConfiguration.temp_min_value < volatileConfiguration.temp_min_min ||
            volatileConfiguration.temp_min_value > volatileConfiguration.temp_max_max - 1) {
          volatileConfiguration.temp_min_value = volatileConfiguration.temp_min_min
          volatileConfiguration.temp_max_value = volatileConfiguration.temp_max_max
        }
        if (volatileConfiguration.temp_max_value < volatileConfiguration.temp_min_value + 1) {
          volatileConfiguration.temp_max_value = volatileConfiguration.temp_min_value + 1
        }

        const scenarioFixes = {} // {<scenario_id>: {toTemperature, controls}}
        for (let scKey in volatileConfiguration.scenarii) {
          const toTemperature = scKey.startsWith('min_') ? volatileConfiguration.temp_min_value : volatileConfiguration.temp_max_value
          const sc = volatileConfiguration.scenarii[scKey]
          if (sc.id) {
            scenarioFixes[sc.id] = scenarioFixes[sc.id] || []
            scenarioFixes[sc.id].push({
              toTemperature: toTemperature,
              controls: _.filter(sc.controls, (v) => { return v.checked === true })
            })
          }
        }

        chainUpdateScenarioTemperatureSettings(scenarioFixes, api)
        .then(() => {
          // return fixed configuration to front side
          reply(volatileConfiguration)
        })
        .catch((err) => {
          console.log(err)
          reply(err).code(500)
        })
      } else if (actionKey === 'update_temperature') {
        const {minmax, value} = db.fixPayload(payload)
        const scenarii = _.filter(configuration.scenarii, (scenario, key) => {
          return key.startsWith(minmax)
        })

        const scenarioFixes = {} // {<scenario_id>: {toTemperature, controls}}
        scenarii.forEach((sc) => {
          if (sc.id) {
            scenarioFixes[sc.id] = scenarioFixes[sc.id] || []
            scenarioFixes[sc.id].push({
              toTemperature: value,
              controls: _.filter(sc.controls, (v) => { return v.checked === true })
            })
          }
        })

        chainUpdateScenarioTemperatureSettings(scenarioFixes, api)
        .then(() => {
          // return fixed configuration to front side
          reply({'status': 'ok'})
        })
        .catch((err) => {
          console.log(err)
          reply(err).code(500)
        })
      } else if (actionKey === 'update_planer') {
        db.updateComponent(page.slug, component.id, payload.planer, (err, page, updatedComponent) => {
          if (err) {
            console.log(err)
            return reply(err).code(500)
          }
          // TODO !2: puis appeler une methode pour mettre a jour le pendule en statefull (qui reste à créer)...
          reply({'status': 'ok'})
        })
      } else {
        // TODO !3: actions bouton "Force 2hrs": force ON et force OFF, comme une bascule bistable
      }
      break

    default:
      // Action not (yet) supported
      reply({}).code(418)
  }
}

// exports
export default actions
