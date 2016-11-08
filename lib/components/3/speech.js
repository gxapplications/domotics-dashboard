'use strict'

const textReferences = {
  'domotic_turned_on': {'en-US': '{title} turned on.', 'fr-FR': '{title} allumé.'},
  'domotic_turned_off': {'en-US': '{title} tunred off.', 'fr-FR': '{title} éteint.'},
  'domotic_turned_on_error': {'en-US': '{title} not turned on properly!', 'fr-FR': '{title} n\'a pas été allumé correctement !'},
  'domotic_turned_off_error': {'en-US': '{title} not turned off properly!', 'fr-FR': '{title} n\'a pas été éteint correctement !'}
}

global.speechComponents = global.speechComponents || {}
Object.assign(global.speechComponents, textReferences)
