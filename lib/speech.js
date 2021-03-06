/* global SpeechSynthesisUtterance */
'use strict'

let textReferences = {
  '_merged': false,
  'welcome': {'en-US': 'Welcome!', 'fr-FR': 'Bienvenue !'}
}

export default function plugSpeech (scope) {
  scope.speech = {
    voice: undefined,
    voices: undefined,
    lang: undefined,
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
      scope.speech._speak(text, intonation)
    },
    listen: (grammar = {}) => {
      // TODO !1: speech recognition: spoken commands system!
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
      scope.speech._speak('Je ne peux pas encore vous entendre. Demandez à mon Dieu de m\'ajouter cette fonctionnalité !', 'error')
    },
    init: (lang = 'en-US') => {
      scope.speech.lang = lang
      if (!('speechSynthesis' in window)) {
        scope.states.speechEngine.error = 'SpeechEngine not available on this browser.'
        return
      }

      // texts are merged dynamically... Once!
      if (!textReferences._merged) {
        textReferences = Object.assign(global.speechComponents, textReferences)
        textReferences._merged = true
      }

      // Async call: getVoices() is a start of an async loading process. onvoiceschanged is the resulting event.
      if (!scope.speech.voices) {
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => {
            scope.speech.voices = window.speechSynthesis.getVoices()
            scope.speech._selectVoice(lang)
          }
        }
      }

      scope.speech._selectVoice(lang)
    },
    _speak: (text, intonation = 'normal') => {
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
    _selectVoice: (lang) => {
      if (scope.speech.voices) {
        scope.speech.voice = scope.speech.voices.find((v) => {
          // Available on Mint, Google Chrome official version:
          // de-DE en-US (x2! M/F) en-GB es-ES es-US fr-FR
          // hi-IN id-ID it-IT ja-JP ko-KR nl-NL pl-PL pt-BR ru-RU zh-CN zh-HK zh-TW
          // Fom android, '-' is replaced by '_' !
          return v.lang.replace('-', '_') === lang.replace('-', '_')
        })
        if (scope.speech.voice) {
          scope.states.speechEngine.lang = lang
        }
      }
    }
  }
  scope.states.speechEngine = {
    lang: undefined,
    error: false
  }
}
