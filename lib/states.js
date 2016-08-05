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

// Socket
states.socketClient = new Nes.Client('ws://' + window.location.host)
states.socketClient.updater = (label) => {
  return (update, flags) => {
    states[label] = update
    // TODO !3: updater angular ou il s'en sort tout seul ?
  }
}
states.socketClient.error = (label) => {
  return (err) => {
    if (err) {
      console.error('Socket client transmission error: ' + err)
    }
  }
}
states.socketClient.onError = (err) => {
  if (err) {
    console.error('Socket client unknown error: ' + err)
    // TODO !4: quand la socket est rompue coté serveur (Ctrl+C), on a des erreurs côté client:
    // - il faut identifier l'erreur (err a identifier, 'Socket error' ?)
    // - il faut laisser faire un retry 5 fois, puis
    // - il faut fermer propre et faire apparaître un message sur l'UX
  }
}

// Init step
states.init = () => {
  states.onDemandScenarii.load()
  states.socketClient.connect((err) => {
    if (err) {
      console.error('Socket client connection failure!')
      return
    }
    states.socketClient.subscribe('/socket/status', states.socketClient.updater('status'), states.socketClient.error('status'))
    states.socketClient.subscribe('/socket/alarm', states.socketClient.updater('alarm'), states.socketClient.error('alarm'))
    states.socketClient.subscribe('/socket/scenarii', states.socketClient.updater('scenarii'), states.socketClient.error('scenarii'))
    states.socketClient.subscribe('/socket/data', states.socketClient.updater('data'), states.socketClient.error('data'))
    states.socketClient.subscribe('/socket/heat', states.socketClient.updater('heat'), states.socketClient.error('heat'))
    states.socketClient.subscribe('/socket/macro', states.socketClient.updater('macro'), states.socketClient.error('macro'))
  })
}

export default states
