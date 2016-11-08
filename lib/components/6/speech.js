'use strict'

const textReferences = {
  'temp_dashboard_temp_update': {
    'en-US': {_: '{who} temperature updated to {value} degrees for {title}.', who: {min: 'economic', max: 'comfort'}},
    'fr-FR': {_: 'Température {who} modifiée à {value} degrés pour {title}.', who: {min: 'en mode économique', max: 'de comfort'}}
  },
  'temp_dashboard_temp_update_error': {'en-US': 'Temperature update failed for {title}!', 'fr-FR': 'Modification de la température pour {title} échouée !'},
  'temp_dashboard_planer_update': {'en-US': 'Planification updated for {title}.', 'fr-FR': 'Programmation modifiée pour {title}.'},
  'temp_dashboard_planer_update_error': {'en-US': 'Planification update failed for {title}!', 'fr-FR': 'Programmation pour {title} échouée !'},
  'temp_dashboard_force_mode_on': {'en-US': 'Comfort mode activated for {title}.', 'fr-FR': 'Mode confort forcé pour {title}.'},
  'temp_dashboard_force_mode_off': {'en-US': 'Programmed mode reactivated for {title}.', 'fr-FR': 'Mode programmé réactivé pour {title}.'},
  'temp_dashboard_force_mode_error': {'en-US': 'Forcing mode failed for {title}!', 'fr-FR': 'Le forçage de mode a échoué pour {title}!'},
  'temp_dashboard_db_not_found_error': {'en-US': 'Error on heating dashboard {title}: component not found!', 'fr-FR': 'Erreur sur le composant {title}. Rechargez la page !'}
}

global.speechComponents = global.speechComponents || {}
Object.assign(global.speechComponents, textReferences)
