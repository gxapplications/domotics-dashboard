/* global SpeechSynthesisUtterance */
'use strict'

const textReferences = {
  '_merged': false,
  'welcome': {'en-US': 'Welcome!', 'fr-FR': 'Bienvenue !'},
  // 'scenario_played': {'en-US': '{title} played.', 'fr-FR': '{title} exécuté.'},
  // 'scenario_played_error': {'en-US': '{title} not played properly!', 'fr-FR': '{title} n\'a pas été exécuté correctement !'},
  'scenario_turned_on': {'en-US': '{title} turned on.', 'fr-FR': '{title} allumé.'},
  'scenario_turned_off': {'en-US': '{title} tunred off.', 'fr-FR': '{title} éteint.'},
  'scenario_turned_on_error': {'en-US': '{title} not turned on properly!', 'fr-FR': '{title} n\'a pas été allumé correctement !'},
  'scenario_turned_off_error': {'en-US': '{title} not turned off properly!', 'fr-FR': '{title} n\'a pas été éteint correctement !'},
  'domotic_turned_on': {'en-US': '{title} turned on.', 'fr-FR': '{title} allumé.'},
  'domotic_turned_off': {'en-US': '{title} tunred off.', 'fr-FR': '{title} éteint.'},
  'domotic_turned_on_error': {'en-US': '{title} not turned on properly!', 'fr-FR': '{title} n\'a pas été allumé correctement !'},
  'domotic_turned_off_error': {'en-US': '{title} not turned off properly!', 'fr-FR': '{title} n\'a pas été éteint correctement !'},
  'heat_mode': {
    'en-US': {_: '{title} turned in {mode} mode.', mode: {eco: 'economic', frost: 'frost', on: 'comfort', off: 'off'}},
    'fr-FR': {_: '{title} est passé en mode {mode}.', mode: {eco: 'économique', frost: 'hors gel', on: 'confort', off: 'éteint'}}
  },
  'heat_mode_error': {'en-US': '{title} mode not turned properly!', 'fr-FR': 'Le mode pour {title} n\'a pas été modifié correctement !'},
  'alarm_level': {
    'en-US': '{title} changed to {level} level.',
    'fr-FR': {_: '{title} {level}.', level: {off: 'désarmée', half: 'partiellement armée', on: 'armée'}}
  },
  'alarm_level_error': {'en-US': '{title} level change failed!', 'fr-FR': 'Le changement de niveau a échoué pour {title} !'},
  'alarm_pattern_ask': {'en-US': 'Please draw your pattern.', 'fr-FR': 'Veuillez dessiner votre schéma.'},
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
  'temp_dashboard_db_not_found_error': {'en-US': 'Error on heating dashboard {title}: component not found!', 'fr-FR': 'Erreur sur le composant {title}. Rechargez la page !'},
  'multiple_scenario_switch': {'en-US': '{title} mode switched.', 'fr-FR': 'Mode basculé pour {title}.'},
  'multiple_scenario_switch_error': {'en-US': 'A scenario did not switch properly!', 'fr-FR': 'Un scénario n\'a pas basculé correctement !'},
  '': {'en-US': '', 'fr-FR': ''}
}

export default function plugSpeech (scope) {
  scope.speech = {
    voice: undefined,
    lang: undefined,
    speak: (text, intonation = 'normal') => {
      if (!scope.speech.voice) {
        scope.speech.init(scope.speech.lang)
      }

      const ut = new SpeechSynthesisUtterance(text)

      switch (intonation) {
        case 'error':
          ut.pitch = 1.2
          ut.rate = 1.0
          break
        // case 'normal':
        default:
          ut.pitch = 1.0
          ut.rate = 1.2
      }

      ut.voice = scope.speech.voice
      window.speechSynthesis.speak(ut)
    },
    speakLang: (textRef, replacements = {}, intonation = 'normal') => {
      let text = textReferences[textRef] && (textReferences[textRef][scope.speech.lang] || textReferences[textRef]['en-US'])
      if (text instanceof Object) {
        for (let replacement in replacements) {
          if (text[replacement] && text[replacement][replacements[replacement]]) {
            replacements[replacement] = text[replacement][replacements[replacement]]
          }
        }
        text = text._
      }
      for (let replacement in replacements) {
        text = text.replace('{' + replacement + '}', replacements[replacement])
      }
      scope.speech.speak(text, intonation)
    },
    listen: (grammar) => {
      // TODO !8: commandes vocales
      /*
       var grammar = '#JSGF V1.0; grammar colors; public <color> = rouge | bleu | rose | jaune | vert | blanc | marron | violet | mauve | noir ;'
       var recognition = new webkitSpeechRecognition();
       var speechRecognitionList = new webkitSpeechGrammarList();
       speechRecognitionList.addFromString(grammar, 1);
       recognition.grammars = speechRecognitionList;
       //recognition.continuous = false;
       recognition.lang = 'fr-FR';
       recognition.interimResults = false;
       recognition.maxAlternatives = 1;
       recognition.onresult = function(event) {
       var color = event.results[0][0].transcript;
       console.log("RESULT:" + color);
       }
       */
    },
    init: (lang = 'en-US') => {
      scope.speech.lang = lang
      if (('speechSynthesis' in window) && window.speechSynthesis.getVoices()) {
        console.log('######## TODO 1, under Android OS & chrome', window.speechSynthesis.getVoices())
        // TODO !0: on Android, what voices are available ? what is the native OS one ? (Electra :))

        scope.speech.voice = window.speechSynthesis.getVoices().filter((v) => {
          // available on Mint: de-DE en-US (x2! M/F) en-GB es-ES es-US fr-FR
          // hi-IN id-ID it-IT ja-JP ko-KR nl-NL pl-PL pt-BR ru-RU zh-CN zh-HK zh-TW
          return v.lang === lang
        })[0]
      }
      if (!textReferences._merged) {
        console.log('do what? ######', global.speechComponents)
        // TODO !0: merge global.speechComponents into textReferences, then delete global.speechComponents ?

        textReferences._merged = true
      }
    }
  }
}
