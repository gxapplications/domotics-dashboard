'use strict'

class Events {
  constructor (toaster) {
    this.toaster = toaster
  }

  successEvent (message, duration = 3000) {
    this.toaster.show(
      this.toaster.simple()
        .textContent(message)
        .position('bottom right').hideDelay(duration)
    )
  }

  warningEvent (message, duration = 6000) {
    this.toaster.show(
      this.toaster.simple()
        .textContent(message)
        .theme('errorToast')
        .position('bottom right').hideDelay(duration)
    )
  }

  errorEvent (message, actionLabel = 'RELOAD', action = window.location.reload.bind(window.location), duration = 6000) {
    this.toaster.show(
      this.toaster.simple()
        .textContent(message)
        .theme('errorToast').action(actionLabel).highlightAction(true).highlightClass('md-accent')
        .position('bottom right').hideDelay(duration)
    ).then(function (response) {
      if (response === 'ok') {
        action()
      }
    })
  }
}

export default Events
