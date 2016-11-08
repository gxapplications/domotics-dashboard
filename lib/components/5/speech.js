'use strict'

const textReferences = {
  'alarm_level': {
    'en-US': '{title} changed to {level} level.',
    'fr-FR': {_: '{title} {level}.', level: {off: 'désarmée', half: 'partiellement armée', on: 'armée'}}
  },
  'alarm_level_error': {'en-US': '{title} level change failed!', 'fr-FR': 'Le changement de niveau a échoué pour {title} !'},
  'alarm_pattern_ask': {'en-US': 'Please draw your pattern.', 'fr-FR': 'Veuillez dessiner votre schéma.'}
}

global.speechComponents = global.speechComponents || {}
Object.assign(global.speechComponents, textReferences)
