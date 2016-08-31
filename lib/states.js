/* eslint-disable no-undef */
'use strict'

import Nes from 'nes'

const states = window.initStates

// OnDemand scenarii, scenarii list, filtered by type
states.onDemandScenarii = [] // void before initialization
states.onDemandScenarii.load = () => {
  if (states.onDemandScenarii.length > 0) {
    return
  }
  states.onDemandScenarii = Object.keys(states.scenarii.value)
    .filter((id) => { return states.scenarii.value[id].type === 1 })
    .map((id) => { return {id: id, label: states.scenarii.value[id].name} })
}
states.activableScenarii = [] // void before initialization
states.activableScenarii.load = () => {
  if (states.activableScenarii.length > 0) {
    return
  }
  states.activableScenarii = Object.keys(states.scenarii.value)
    .filter((id) => { return states.scenarii.value[id].type !== 1 })
    .map((id) => { return {id: id, label: states.scenarii.value[id].name} })
}

// Socket
states.socketClient = new Nes.Client('ws://' + window.location.host)
states.socketClient.updater = (label) => {
  return (update, flags) => {
    console.log('WS Update received for label ' + label + ': ', update)
    states[label] = update
  }
}
states.socketClient.onSubscriptionError = (label) => {
  return (err) => {
    if (err) {
      console.error('Socket client transmission error: ' + err)
    }
  }
}
states.socketClient.error = false
states.socketClient.errorCount = 0
states.socketClient.onError = (err) => {
  if (err) {
    console.error('Socket client error: ' + err)
    if (err.toString() === 'Error: Socket error') {
      states.socketClient.error = true
      states.socketClient.errorCount++
    }
  }
}
states.socketClient.onConnect = () => {
  states.socketClient.error = false
  states.socketClient.errorCount = 0
}

// Init step
states.init = () => {
  states.onDemandScenarii.load()
  states.activableScenarii.load()
  states.socketClient.connect({retries: 10, delay: 2000, maxDelay: 8000}, (err) => {
    if (err) {
      console.error('Socket client connection failure: ', err)
      return
    }
    states.socketClient.subscribe('/socket/status', states.socketClient.updater('status'), states.socketClient.onSubscriptionError('status'))
    states.socketClient.subscribe('/socket/alarm', states.socketClient.updater('alarm'), states.socketClient.onSubscriptionError('alarm'))
    states.socketClient.subscribe('/socket/scenarii', states.socketClient.updater('scenarii'), states.socketClient.onSubscriptionError('scenarii'))
    states.socketClient.subscribe('/socket/domotic', states.socketClient.updater('domotic'), states.socketClient.onSubscriptionError('domotic'))
    states.socketClient.subscribe('/socket/data', states.socketClient.updater('data'), states.socketClient.onSubscriptionError('data'))
    states.socketClient.subscribe('/socket/heat', states.socketClient.updater('heat'), states.socketClient.onSubscriptionError('heat'))
    states.socketClient.subscribe('/socket/macro', states.socketClient.updater('macro'), states.socketClient.onSubscriptionError('macro'))
  })
}

export default states
