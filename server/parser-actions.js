'use strict'

const actions = function (api, reply, page, component, action = null, payload = {}) {
  // let macroId = `c_${component.id}`
  // const configuration = JSON.parse(component.configuration)
  // let actions = []
  // let firstAction = null
  switch (component.type) {
    case 501:
      // 501: RATP RER timetable parser

      // TODO !2: a partir de ca: https://github.com/gxapplications/myfox-wrapper-api/blob/master/lib/html-parsers/index.js#L40
      // - recup URL dans la config du component
      // - parsing de l'url (protocole, hostname, port, path, etc...) -> http ou https ?
      // - fabrication requestData (method GET pour le moment, headers de base a mettre en config)
      // - req
      // - branchement parser qui correspond

      /*
       Mettre la timetable ratp rer.
       Dans un 1er temps, en statique, mettre ici un "loader". Puis unez req ajax va remplacer par le contenu. Le script sera donc inclu via myfox-actions.js

       lines = "div#prochains_passages > fieldset > table > tbody > tr"
       foreach lines,
       - td.name .html() -> Nom train
       - td.passing_time .html() -> heure ou 'Train à l'approche'

       Gestion des messages d'incident :
       "div#prochains_passages > fieldset > div.message" .html()

       Heure de refresh :
       "div#prochains_passages > fieldset > div.date_time > span.time"

       */

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
