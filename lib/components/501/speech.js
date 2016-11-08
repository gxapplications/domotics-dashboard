'use strict'

const textReferences = {
  'ratp_incident': {'en-US': 'R A T P message received. {msg}', 'fr-FR': 'Message reçu de la R A T P. {msg}'}
}

global.speechComponents = global.speechComponents || {}
Object.assign(global.speechComponents, textReferences)
