'use strict'

const actions = function (api, reply, page, component, action = null, payload = {}) {
  // let macroId = `c_${component.id}`
  // const configuration = JSON.parse(component.configuration)
  // let actions = []
  // let firstAction = null
  switch (component.type) {
    case 501:
      // 501: RATP RER timetable parser
      // TODO !3
      break

    case 511:
      // 511: Meteo Blue parser
      // TODO !3
      break

    default:
      // Action not (yet) supported
      reply({}).code(418)
  }
}

// exports
export default actions
