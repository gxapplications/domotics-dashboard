/* global SpeechSynthesisUtterance, alert */
'use strict'

let textReferences = {
  '_merged': false,
  'welcome': {'en-US': 'Welcome!', 'fr-FR': 'Bienvenue !'},
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
        console.log('######## TODO 0, under Android OS & chrome', window.speechSynthesis.getVoices())
        alert('Voices under android ? ' + window.speechSynthesis.getVoices())
        if (window.speechSynthesis.getVoices()[0]) {
          alert(window.speechSynthesis.getVoices()[0])
        }
        // TODO !0: on Android, what voices are available ? what is the native OS one ? (Electra :))

        scope.speech.voice = window.speechSynthesis.getVoices().find((v) => {
          // available on Mint: de-DE en-US (x2! M/F) en-GB es-ES es-US fr-FR
          // hi-IN id-ID it-IT ja-JP ko-KR nl-NL pl-PL pt-BR ru-RU zh-CN zh-HK zh-TW
          return v.lang === lang
        })
      }
      if (!textReferences._merged) {
        console.log('######## TODO 0, Test speech refs available... Test scenario play action!')
// TODO !0: tester
        textReferences = Object.assign(global.speechComponents, textReferences)
        textReferences._merged = true
      }
    }
  }
}
