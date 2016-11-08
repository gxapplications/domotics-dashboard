'use strict'

const textReferences = {
  'heat_mode': {
    'en-US': {_: '{title} turned in {mode} mode.', mode: {eco: 'economic', frost: 'frost', on: 'comfort', off: 'off'}},
    'fr-FR': {_: '{title} est passé en mode {mode}.', mode: {eco: 'économique', frost: 'hors gel', on: 'confort', off: 'éteint'}}
  },
  'heat_mode_error': {'en-US': '{title} mode not turned properly!', 'fr-FR': 'Le mode pour {title} n\'a pas été modifié correctement !'}
}

global.speechComponents = global.speechComponents || {}
Object.assign(global.speechComponents, textReferences)
