/* global SpeechSynthesisUtterance */
'use strict'

const textReferences = {
  'welcome': {'en-US': 'Welcome!', 'fr-FR': 'Bienvenue !'},
  'scenario_played': {'en-US': '{title} played.', 'fr-FR': '{title} exécuté.'},
  'scenario_played_error': {'en-US': '{title} not played properly!', 'fr-FR': '{title} n\'a pas été exécuté correctement !'},
  '': {'en-US': '', 'fr-FR': ''}
}

export default function (scope) {
  scope.speech = {
    voice: undefined,
    lang: undefined,
    speak: (text, intonation = 'normal') => {
      if (!scope.speech.voice) {
        scope.speech.init(scope.speech.lang)
      }

      // TODO !5: use intonation (== (normal|error))
      const ut = new SpeechSynthesisUtterance(text)
      ut.voice = scope.speech.voice
      window.speechSynthesis.speak(ut)
    },
    speakLang: (textRef, replacements = {}, intonation = 'normal') => {
      let text = textReferences[textRef] && (textReferences[textRef][scope.speech.lang] || textReferences[textRef]['en-US'])
      for (let replacement in replacements) {
        text = text.replace('{' + replacement + '}', replacements[replacement])
      }
      scope.speech.speak(text, intonation)
    },
    listen: (grammar) => {
      // TODO !5: commandes vocales ? ou plus tard...
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
      if (('speechSynthesis' in window) && window.speechSynthesis.getVoices()) {
        if (!scope.speech.voice || lang !== scope.speech.lang) {
          // FIXME !0: problem : still with german voice, even for fr-FR !
          scope.speech.voice = window.speechSynthesis.getVoices().filter((v) => {
            // available on Mint: de-DE en-US (x2! M/F) en-GB es-ES es-US fr-FR
            // hi-IN id-ID it-IT ja-JP ko-KR nl-NL pl-PL pt-BR ru-RU zh-CN zh-HK zh-TW
            return v.lang === lang
            // FIXME !5: on Android, what voices are available ? what is the native OS one ? (Electra :))
          })[0]
          scope.speech.lang = lang
        }
      }
    }
  }
}
