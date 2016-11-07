'use strict'

const textReferences = {
  'scenario_played': {'en-US': '{title} played.', 'fr-FR': '{title} exécuté.'},
  'scenario_played_error': {
    'en-US': '{title} not played properly!',
    'fr-FR': '{title} n\'a pas été exécuté correctement !'
  }
}

global.speechComponents = global.speechComponents || {}
Object.assign(global.speechComponents, textReferences)
