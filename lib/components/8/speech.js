'use strict'

const textReferences = {
  'multiple_scenario_switch': {'en-US': '{title} mode switched.', 'fr-FR': 'Mode basculé pour {title}.'},
  'multiple_scenario_switch_error': {'en-US': 'A scenario did not switch properly!', 'fr-FR': 'Un scénario n\'a pas basculé correctement !'}
}

global.speechComponents = global.speechComponents || {}
Object.assign(global.speechComponents, textReferences)
