'use strict'

import _ from 'lodash'
import db from '../../../server/db'

import Planer from './planer'

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

const actions = function (api, reply, page, component, action = null, payload = {}) {
  const configuration = JSON.parse(component.configuration)
  const [actionKey, actionData] = action.split('-')

  if (actionKey === 'inspect_temperatures') {
    api.inspectScenarioTemperatureSettings(actionData, (err, data) => {
      if (err) {
        console.log(err)
        return reply(err).code(500)
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
          controls: _.filter(_.map(sc.controls, (control, idx) => { return Object.assign({condition: idx}, control) }), (v) => { return v.checked === true })
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
          controls: _.filter(_.map(sc.controls, (control, idx) => { return Object.assign({condition: idx}, control) }), (v) => { return v.checked === true })
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
    const newConfiguration = Object.assign({}, configuration, db.fixPayload(payload))
    db.updateComponent(page.slug, component.id, {configuration: newConfiguration}, (err, page, updatedComponent) => {
      if (err) {
        console.log(err)
        return reply(err).code(500)
      }

      api.component6Planers = api.component6Planers || []
      const planer = api.component6Planers.find((planer) => { return planer.id === component.id })
      if (planer) {
        planer.updateData(newConfiguration.planer)
      } else {
        api.component6Planers.push(new Planer(component.id, newConfiguration.planer, api))
      }

      reply({'status': 'ok'})
    })
  } else if (actionKey === 'force') {
    const planer = api.component6Planers.find((planer) => { return planer.id === component.id })
    const activation = payload.activation

    if (planer) {
      planer.forceComfortMode(activation === 'true')
    }

    reply({'status': 'ok'})
  }
}

// exports
export default actions
