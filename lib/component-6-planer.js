'use strict'

import schedule from 'node-schedule'
import assignDeep from 'assign-deep'
import db from '../server/db'

class Planer {
  constructor (id, data, api) {
    this.id = id
    this.data = data
    this.api = api
    this.forceMode = false
    this.timer = null

    this.initialize()
  }

  initialize () {
    console.log(`Heating dashboard planer - Scheduler adding for #${this.id}...`)

    this._persistentStateUpdate()

    // job scheduled every XX:00:01 and XX:30:01
    this.scheduledJob = schedule.scheduleJob('1 0,30 * * * *', this._checkModeChange.bind(this))
    // TODO !2: au moment db.deleteComponent (coté serveur seulement), declencher : cancelJob(this.scheduledJob)

    console.log(`Heating dashboard planer - Scheduler #${this.id} initialized.`)
  }

  updateData (newData) {
    const prevDataForNow = this.data[this._getDataIndexForNow()]

    this.data = newData
    console.log(`Heating dashboard planer - Scheduler #${this.id} data updated.`)

    // In case the 'now index' in data changed, triggers a check. Supposing index will not change
    // between prevDataForNow calculation and _checkModeChange call ( matter of milliseconds bad chance...)
    this._checkModeChange(prevDataForNow) // in case the data changed at 'now index'
  }

  forceComfortMode (state = true) {
    console.log(`Heating dashboard planer - Scheduler #${this.id} force mode to ${state ? 'on' : 'off'}.`)

    this.forceMode = state
    this._changeMode(state)

    if (this.timer) {
      // cancel timer anyway
      clearTimeout(this.timer)
      this.timer = null
    }

    if (state) {
      // (re)create timer
      this.timer = setTimeout(this.forceComfortMode.bind(this, false), 7200000) // 2hrs = 2*60*60*1000
    }

    this._persistentStateUpdate()
  }

  _getDataIndexForNow () {
    const now = new Date()
    // based on 48 segments by day: 1 segment for 30 minutes
    return (now.getHours() * 2) + (now.getMinutes() > 29 ? 1 : 0)
  }

  _checkModeChange (prevDataForNow = undefined) {
    if (this.forceMode) {
      return // force mode has already changed the mode to comfort at its begins. Wait for force mode to end by itself.
    }

    const nowIndex = this._getDataIndexForNow()
    const dataForNow = this.data[nowIndex]

    if (prevDataForNow === undefined) {
      // nowIndex - 1 except for midnight case -> yesterday
      const prevIndex = (nowIndex === 0) ? 47 : (nowIndex - 1)
      prevDataForNow = this.data[prevIndex]
    }

    if (prevDataForNow !== dataForNow) {
      // Mode must change now!
      this._changeMode(dataForNow === 1) // 1 means comfort mode -> true
      console.log(`Heating dashboard planer - Scheduler #${this.id} detected a required mode change.`)
    }
  }

  _changeMode (toComfort) {
    db.getComponentById(null, this.id, (err, component) => {
      if (err) {
        console.log(err)
        // TODO !3: send error to interface trough socket
        return
      }
      const configuration = JSON.parse(component.configuration)
      const sc = configuration.mode_scenarii
      const comfort = [sc.comfort_1, sc.comfort_2, sc.comfort_3, sc.comfort_4].filter((s) => (s && s.length > 0))
      const eco = [sc.eco_1, sc.eco_2, sc.eco_3, sc.eco_4].filter((s) => (s && s.length > 0))

      const toTurnOff = toComfort ? eco : comfort
      const toTurnOn = toComfort ? comfort : eco

      this._switchScenariiInSerial(toTurnOff, 'off')
        .then(this._switchScenariiInSerial.bind(this, toTurnOn, 'on'))
        .then(() => {
          console.log(`Heating dashboard planer - Scheduler #${this.id} mode changed.`)
        })
        .catch(() => {
          console.log(`Heating dashboard planer - Scheduler #${this.id} mode change failed.`)
          // TODO !3: send error to interface trough socket
        })
    })
  }

  _switchScenariiInSerial (scenarii, state) {
    return scenarii.reduce((prom, scenario) => {
      return prom.then(() => {
        return new Promise((resolve, reject) => {
          this.api.callScenarioAction({ id: scenario, action: state }, (err, data) => {
            if (err) {
              console.log(err)
              return reject(err)
            }
            resolve(data)
          })
        })
      })
    }, Promise.resolve())
  }

  _persistentStateUpdate () {
    // store forceMode in the persistent state 'data', linked to client side through socket
    let dataStates = assignDeep({}, this.api.persistentStates.data ? this.api.persistentStates.data.value || {} : {})
    dataStates[`domotic_heating_dashboard_${this.id}`] = { force_mode: this.forceMode, component: this.id }
    this.api.persistentStates.data.push(dataStates)
  }
}

export default Planer
