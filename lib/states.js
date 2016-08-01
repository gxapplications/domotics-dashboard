/* eslint-disable no-undef */
'use strict'

const states = window.initStates

states.onDemandScenarii = [] // void before initialization
states.onDemandScenarii.load = () => {
  if (states.onDemandScenarii.length > 0) {
    return
  }
  states.onDemandScenarii = Object.keys(states.scenarii.value)
      .filter(id => { return states.scenarii.value[id].type === 1 })
      .map(id => { return {id: id, label: states.scenarii.value[id].name} })
}

states.init = () => {
    states.onDemandScenarii.load()
    // TODO !8: register here with a socket, and listen to update $scope.states :)
    //console.log(states)
}

export default states
